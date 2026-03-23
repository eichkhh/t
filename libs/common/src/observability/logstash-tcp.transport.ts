import * as net from 'node:net';
import Transport from 'winston-transport';

interface LogstashTcpTransportOptions extends Transport.TransportStreamOptions {
  host: string;
  port: number;
  maxBufferSize?: number;
  reconnectDelayMs?: number;
}

export class LogstashTcpTransport extends Transport {
  private socket: net.Socket | null = null;
  private readonly buffer: string[] = [];
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private isClosed = false;

  private readonly host: string;
  private readonly port: number;
  private readonly maxBufferSize: number;
  private readonly reconnectDelayMs: number;

  constructor(opts: LogstashTcpTransportOptions) {
    super(opts);
    this.host = opts.host;
    this.port = opts.port;
    this.maxBufferSize = opts.maxBufferSize ?? 500;
    this.reconnectDelayMs = opts.reconnectDelayMs ?? 5_000;
    this.connect();
  }

  private connect(): void {
    if (this.isClosed) return;

    this.socket = new net.Socket();

    this.socket.on('connect', () => {
      for (const msg of this.buffer) {
        this.socket?.write(msg);
      }
      this.buffer.length = 0;
    });

    this.socket.on('error', () => this.scheduleReconnect());
    this.socket.on('close', () => this.scheduleReconnect());

    this.socket.connect(this.port, this.host);
  }

  private scheduleReconnect(): void {
    if (this.isClosed || this.reconnectTimer) return;
    this.socket?.destroy();
    this.socket = null;
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.connect();
    }, this.reconnectDelayMs);
  }

  override log(info: Record<string, unknown>, callback: () => void): void {
    const line = JSON.stringify(info) + '\n';

    if (this.socket?.writable) {
      this.socket.write(line);
    } else {
      this.buffer.push(line);
      if (this.buffer.length > this.maxBufferSize) {
        this.buffer.shift();
      }
    }

    this.emit('logged', info);
    callback();
  }

  override close(): void {
    this.isClosed = true;
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this.socket?.destroy();
    this.socket = null;
  }
}
