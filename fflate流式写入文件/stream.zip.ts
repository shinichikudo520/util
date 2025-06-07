type ILevel = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

class ChunkedZipValidator {
  static readonly LOCAL_HEADER = [0x50, 0x4b, 0x03, 0x04];
  static readonly CENTRAL_DIR = [0x50, 0x4b, 0x01, 0x02];

  static validate(chunks: Uint8Array[]): void {
    // 验证本地文件头
    this.scanChunks(chunks, 0, this.LOCAL_HEADER, "Missing local file header");

    // 查找中央目录记录
    const centralPos = this.findSignatureAcrossChunks(chunks, this.CENTRAL_DIR);
    if (centralPos.chunkIndex === -1) {
      throw new Error("Central directory signature not found");
    }
  }

  private static scanChunks(
    chunks: Uint8Array[],
    globalOffset: number,
    signature: number[],
    errorMsg: string
  ): void {
    let remaining = signature.length;
    let sigIndex = 0;

    for (const chunk of chunks) {
      for (let i = 0; i < chunk.length && sigIndex < signature.length; i++) {
        if (chunk[i] !== signature[sigIndex]) {
          throw new Error(`${errorMsg} at position ${globalOffset + i}`);
        }
        sigIndex++;
        remaining--;
      }
      globalOffset += chunk.length;
      if (remaining <= 0) break;
    }
  }

  private static findSignatureAcrossChunks(
    chunks: Uint8Array[],
    signature: number[]
  ): { chunkIndex: number; position: number } {
    let globalOffset = 0;

    for (let chunkIdx = 0; chunkIdx < chunks.length; chunkIdx++) {
      const chunk = chunks[chunkIdx];
      for (let i = 0; i <= chunk.length - signature.length; i++) {
        let match = true;
        for (let j = 0; j < signature.length; j++) {
          if (i + j >= chunk.length) {
            // 跨块匹配处理
            if (chunkIdx + 1 >= chunks.length) {
              match = false;
              break;
            }
            if (chunks[chunkIdx + 1][i + j - chunk.length] !== signature[j]) {
              match = false;
              break;
            }
          } else if (chunk[i + j] !== signature[j]) {
            match = false;
            break;
          }
        }
        if (match) {
          return {
            chunkIndex: chunkIdx,
            position: i,
          };
        }
      }
      globalOffset += chunk.length;
    }
    return { chunkIndex: -1, position: -1 };
  }
}

class StreamZip {
  /** zip 对象 */
  private zip: fflate.Zip;
  /** file 对象 */
  private files: Record<string, fflate.ZipDeflate> = {};
  /** 数据块 */
  private chunks: Uint8Array[] = [];
  /** 压缩率 */
  private readonly level: ILevel;

  constructor(level: ILevel = 6) {
    this.zip = new fflate.Zip((err, chunk) => {
      if (err) throw err;
      this.chunks.push(chunk);
    });
    this.level = level;
  }

  public addFolder(foldername: string) {
    const path = `${foldername}/`;
    this.addFile(path);
  }

  public addFile(filename: string): void {
    const stream = new fflate.ZipDeflate(filename, { level: this.level });
    this.files[filename] = stream;
    this.zip.add(stream);
  }

  public appendData(filename: string, data: Uint8Array): void {
    if (!this.files[filename]) throw new Error(`File ${filename} not exists`);
    this.files[filename].push(data);
  }

  public async finalize(): Promise<Uint8Array[]> {
    // 终止所有文件流
    Object.values(this.files).forEach((stream) => {
      stream.push(new Uint8Array(0), true);
    });
    this.zip.end();

    ChunkedZipValidator.validate(this.chunks);
    return this.chunks;
  }

  public async unit8array(): Promise<Uint8Array> {
    const result = await this.finalize();
    const merged = this.mergeChunks(result);
    return merged;
  }
  /** 合并数据块 */
  private mergeChunks(chunks: Uint8Array[]): Uint8Array {
    const totalSize = chunks.reduce((sum, c) => sum + c.length, 0);
    const result = new Uint8Array(totalSize);
    let offset = 0;
    chunks.forEach((chunk) => {
      result.set(chunk, offset);
      offset += chunk.length;
    });
    return result;
  }

  public async blob(): Promise<Blob> {
    const result = await this.finalize();
    return new Blob(result, { type: "application/zip" });
  }
}

const btn = document.getElementById("btn");
if (btn) {
  btn.addEventListener("click", async function () {
    const zip = new StreamZip(9);
    zip.addFolder("main");
    zip.addFile(`main/Hello world.txt`);
    zip.appendData(
      `main/Hello world.txt`,
      new TextEncoder().encode("Hello world")
    );
    zip.addFile(`main/Hello world1.txt`);
    zip.appendData(
      `main/Hello world1.txt`,
      new TextEncoder().encode("Hello world1")
    );

    const blob = await zip.blob();
    // 创建下载链接（可选）
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "StreamZip.zip";
    document.body.appendChild(a);
    a.click();
  });
}
