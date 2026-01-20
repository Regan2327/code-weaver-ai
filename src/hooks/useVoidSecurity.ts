import { useState, useEffect, useCallback } from 'react';
import { openDB, IDBPDatabase } from 'idb';

interface VoidDB {
  keys: {
    key: string;
    value: {
      key: CryptoKey;
      createdAt: Date;
    };
  };
}

interface EncryptedData {
  ciphertext: ArrayBuffer;
  iv: Uint8Array;
}

const DB_NAME = 'neurodrive-void';
const STORE_NAME = 'keys';
const KEY_ID = 'master-key';

export const useVoidSecurity = () => {
  const [isKeyReady, setIsKeyReady] = useState(false);
  const [isVoided, setIsVoided] = useState(false);
  const [db, setDb] = useState<IDBPDatabase<VoidDB> | null>(null);
  const [cryptoKey, setCryptoKey] = useState<CryptoKey | null>(null);

  // Initialize IndexedDB and check/create key
  useEffect(() => {
    const initDB = async () => {
      try {
        const database = await openDB<VoidDB>(DB_NAME, 1, {
          upgrade(db) {
            if (!db.objectStoreNames.contains(STORE_NAME)) {
              db.createObjectStore(STORE_NAME, { keyPath: 'key' });
            }
          },
        });
        setDb(database);

        // Check for existing key
        const existingKey = await database.get(STORE_NAME, KEY_ID);
        
        if (existingKey) {
          setCryptoKey(existingKey.value.key);
          setIsKeyReady(true);
        } else {
          // Generate new AES-GCM key
          const key = await window.crypto.subtle.generateKey(
            {
              name: 'AES-GCM',
              length: 256,
            },
            true, // extractable
            ['encrypt', 'decrypt']
          );

          await database.put(STORE_NAME, {
            key: KEY_ID,
            value: {
              key,
              createdAt: new Date(),
            },
          });

          setCryptoKey(key);
          setIsKeyReady(true);
        }
      } catch (error) {
        console.error('[VoidSecurity] Failed to initialize:', error);
        setIsVoided(true);
      }
    };

    initDB();
  }, []);

  // Encrypt a message
  const encryptMessage = useCallback(async (text: string): Promise<EncryptedData | null> => {
    if (!cryptoKey) {
      console.error('[VoidSecurity] No key available for encryption');
      return null;
    }

    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(text);
      const iv = window.crypto.getRandomValues(new Uint8Array(12));

      const ciphertext = await window.crypto.subtle.encrypt(
        {
          name: 'AES-GCM',
          iv,
        },
        cryptoKey,
        data
      );

      return { ciphertext, iv };
    } catch (error) {
      console.error('[VoidSecurity] Encryption failed:', error);
      return null;
    }
  }, [cryptoKey]);

  // Decrypt a message
  const decryptMessage = useCallback(async (ciphertext: ArrayBuffer, iv: Uint8Array): Promise<string | null> => {
    if (!cryptoKey) {
      console.error('[VoidSecurity] No key available for decryption');
      return null;
    }

    try {
      const decrypted = await window.crypto.subtle.decrypt(
        {
          name: 'AES-GCM',
          iv: iv as BufferSource,
        },
        cryptoKey,
        ciphertext
      );

      const decoder = new TextDecoder();
      return decoder.decode(decrypted);
    } catch (error) {
      console.error('[VoidSecurity] Decryption failed (key may be voided):', error);
      return null;
    }
  }, [cryptoKey]);

  // THE VOID - Permanently destroy the encryption key
  const voidSession = useCallback(async (): Promise<boolean> => {
    if (!db) return false;

    try {
      // Step 1: Generate random data to overwrite
      const randomData = new Uint8Array(32);
      crypto.getRandomValues(randomData);
      
      // Step 2: Overwrite the key with random garbage (corrupts the stored key)
      await db.put(STORE_NAME, {
        key: KEY_ID,
        value: {
          key: randomData as unknown as CryptoKey,
          createdAt: new Date(),
        },
      });
    
      // Step 3: Delete the key entirely
      await db.delete(STORE_NAME, KEY_ID);

      // Step 4: Clear state
      setCryptoKey(null);
      setIsKeyReady(false);
      setIsVoided(true);

      console.log('[VoidSecurity] Session voided. All encrypted data is now permanently unreadable.');
      return true;
    } catch (error) {
      console.error('[VoidSecurity] Void operation failed:', error);
      return false;
    }
  }, [db]);

  // Convert ArrayBuffer to base64 for storage
  const arrayBufferToBase64 = useCallback((buffer: ArrayBuffer): string => {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    bytes.forEach(b => binary += String.fromCharCode(b));
    return btoa(binary);
  }, []);

  // Convert base64 back to ArrayBuffer
  const base64ToArrayBuffer = useCallback((base64: string): ArrayBuffer => {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
  }, []);

  // Helper to convert Uint8Array to base64
  const uint8ArrayToBase64 = useCallback((arr: Uint8Array): string => {
    let binary = '';
    arr.forEach(b => binary += String.fromCharCode(b));
    return btoa(binary);
  }, []);

  // Helper to convert base64 to Uint8Array
  const base64ToUint8Array = useCallback((base64: string): Uint8Array => {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  }, []);

  return {
    isKeyReady,
    isVoided,
    encryptMessage,
    decryptMessage,
    voidSession,
    // Utility functions for serialization
    arrayBufferToBase64,
    base64ToArrayBuffer,
    uint8ArrayToBase64,
    base64ToUint8Array,
  };
};
