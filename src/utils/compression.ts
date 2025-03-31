/**
 * Utility functions for compressing and decompressing data using CompressionStream with gzip
 */

/**
 * Compresses a string using CompressionStream with gzip and returns a base64 encoded string
 * @param data - The string data to compress
 * @returns A Promise that resolves to the compressed data as a base64 string
 */
export async function compressData(data: string): Promise<string> {
  try {
    // Convert string to Uint8Array
    const encoder = new TextEncoder();
    const uint8Array = encoder.encode(data);

    // Create a stream from the Uint8Array
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(uint8Array);
        controller.close();
      },
    });

    // Compress the stream using gzip
    const compressedStream = stream.pipeThrough(new CompressionStream("gzip"));

    // Read the compressed stream
    const reader = compressedStream.getReader();
    const chunks: Uint8Array[] = [];

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
    }

    // Combine chunks and convert to base64 for storage
    const compressedArray = new Uint8Array(
      chunks.reduce((acc, chunk) => acc + chunk.length, 0)
    );

    let offset = 0;
    for (const chunk of chunks) {
      compressedArray.set(chunk, offset);
      offset += chunk.length;
    }

    return btoa(String.fromCharCode(...compressedArray));
  } catch (error) {
    console.error("Error compressing data:", error);
    return data; // Fallback to uncompressed data
  }
}

/**
 * Decompresses a base64 encoded string that was compressed with gzip
 * @param compressedData - The compressed data as a base64 string
 * @returns A Promise that resolves to the decompressed string
 */
export async function decompressData(compressedData: string): Promise<string> {
  try {
    // Convert base64 to Uint8Array
    const binaryString = atob(compressedData);
    const uint8Array = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      uint8Array[i] = binaryString.charCodeAt(i);
    }

    // Create a stream from the Uint8Array
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(uint8Array);
        controller.close();
      },
    });

    // Decompress the stream
    const decompressedStream = stream.pipeThrough(
      new DecompressionStream("gzip")
    );

    // Read the decompressed stream
    const reader = decompressedStream.getReader();
    const chunks: Uint8Array[] = [];

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
    }

    // Combine chunks and convert back to string
    const decompressedArray = new Uint8Array(
      chunks.reduce((acc, chunk) => acc + chunk.length, 0)
    );

    let offset = 0;
    for (const chunk of chunks) {
      decompressedArray.set(chunk, offset);
      offset += chunk.length;
    }

    const decoder = new TextDecoder();
    return decoder.decode(decompressedArray);
  } catch (error) {
    console.error("Error decompressing data:", error);
    return compressedData; // Return the original data if decompression fails
  }
}

/**
 * Checks if a string appears to be base64 encoded (likely compressed)
 * @param data - The string to check
 * @returns True if the string appears to be base64 encoded
 */
export function isCompressedData(data: string): boolean {
  return /^[A-Za-z0-9+/=]+$/.test(data);
}

/**
 * Compares and logs the size difference between original and compressed data
 * @param originalData - The original uncompressed data
 * @param compressedData - The compressed data
 * @returns An object containing size information
 */
export function compareDataSizes(
  originalData: string,
  compressedData: string
): {
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
  savings: number;
} {
  const originalSize = new Blob([originalData]).size;
  const compressedSize = new Blob([compressedData]).size;
  const compressionRatio = compressedSize / originalSize;
  const savings = 100 - compressionRatio * 100;

  console.log(`Original size: ${originalSize} bytes`);
  console.log(`Compressed size: ${compressedSize} bytes`);
  console.log(`Compression ratio: ${compressionRatio.toFixed(2)}`);
  console.log(`Space savings: ${savings.toFixed(2)}%`);

  return {
    originalSize,
    compressedSize,
    compressionRatio,
    savings,
  };
}
