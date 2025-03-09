# 📜 **LoggerService Documentation**

## 🎯 **Overview**
The `LoggerService` in this NestJS application provides a **centralized logging system** that:  
✅ Logs messages to **console, files (daily rotation), and Elasticsearch** (for analysis in Kibana).  
✅ Supports **structured logging** with metadata (timestamps, request details, errors, etc.).  
✅ Automatically **tracks HTTP request context** (request ID, IP, method, URL).

---

# 📌 **Core Functionalities**

## 1️⃣ **Logging System Initialization (Constructor)**
When `LoggerService` is initialized, it creates a **Winston logger** that:
- **Logs to the console** for real-time debugging.
- **Stores logs in rotating files** (`logs/app-YYYY-MM-DD.log`).
- **Sends logs to Elasticsearch** for centralized log storage & analysis.

### 📜 **Code: Logger Initialization**
```ts
constructor() {
  this.logger = createLogger({
    level: 'info', // Default log level
    format: format.combine(
      format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      format.errors({ stack: true }),
      format.json()
    ),
    transports: [
      new transports.Console({
        format: format.combine(
          format.colorize({ all: true }),
          format.printf(this.formatLog),
        ),
      }),
      new winston.transports.DailyRotateFile({
        dirname: 'logs',
        filename: 'app-%DATE%.log',
        datePattern: 'YYYY-MM-DD',
        maxFiles: '30d',
      }),
    ],
  });

  // ✅ Adds Elasticsearch Transport for Log Monitoring in Kibana
  this.logger.add(
    new ElasticsearchTransport({
      level: 'warn', // ✅ Stores only `warn` & `error` logs
      clientOpts: { node: process.env.ELASTICSEARCH_URL || 'http://localhost:9200' },
    })
  );
}
```
📌 **What Happens When LoggerService Starts?**  
1️⃣ **Initializes Winston logger** with different storage locations.  
2️⃣ **Sets up transporters** (console, file rotation, Elasticsearch).  
3️⃣ **Ensures logs are structured & searchable**.

---

## 2️⃣ **Logging Messages (`log()` and `error()`)**
These methods allow other parts of the application to log **messages and errors**.

### 📜 **Code: Logging Methods**
```ts
log(message: string, ...optionalParams: any[]) {
  const metadata = optionalParams[0] || {};
  this.print('info', message, metadata);
}

error(message: string, ...optionalParams: any[]) {
  const error = optionalParams[0] instanceof Error ? optionalParams[0] : undefined;
  const metadata = optionalParams.length > 1 ? optionalParams[1] : {};
  this.print('error', message, { ...metadata, error: error?.stack });
}
```
📌 **What Happens When You Log a Message?**  
1️⃣ The service **formats** the log.  
2️⃣ It **adds metadata** (request ID, IP, etc.).  
3️⃣ It **writes logs to multiple places**:
- **Console** (`info`, `warn`, `error`)
- **Log file** (`info`, `warn`, `error`)
- **Elasticsearch** (`warn`, `error`)

---

## 3️⃣ **Formatting & Sending Logs (`print()`)**
The `print()` method ensures logs are **structured** before sending them to all transports.

### 📜 **Code: Structuring Logs**
```ts
private print(level: string, message: string, metadata?: Record<string, unknown>) {
  const entry = {
    timestamp: new Date().toISOString(),
    level,
    context: this.context, // "GlobalLogger"
    message,
    ...this.requestMetadata, // Stores request info if available
    ...metadata,
  };
  this.logger.log(level, message, entry);
}
```
📌 **Why This Matters?**  
✅ Logs **contain structured metadata** (timestamp, log level, context, message, request info).  
✅ Ensures **uniform logs across console, files, and Elasticsearch**.

---

## 4️⃣ **Tracking HTTP Requests (`setRequest()`)**
This method **associates logs with incoming HTTP requests**, storing:  
🔹 **Request ID** (to trace logs for the same request).  
🔹 **User-Agent** (browser/client details).  
🔹 **IP Address** (who made the request).  
🔹 **HTTP Method & URL**.

### 📜 **Code: Extracting Request Data**
```ts
setRequest(request: Request) {
  this.requestMetadata = {
    requestId: request.headers['x-request-id'] || this.generateRequestId(),
    userAgent: request.headers['user-agent'],
    ip: request.ip,
    method: request.method,
    url: request.originalUrl,
  };
}
```
📌 **What Happens When a Request Is Logged?**  
1️⃣ The middleware calls `setRequest()` when handling a request.  
2️⃣ Request metadata is **stored** in `LoggerService`.  
3️⃣ All logs from this request **automatically include** the request ID, user-agent, and IP.

---

## 5️⃣ **Generating Unique Request IDs (`generateRequestId()`)**
If a request does not include an **`x-request-id`**, a unique **random request ID** is generated.

### 📜 **Code: Generate Unique Request ID**
```ts
private generateRequestId(): string {
  return Math.random().toString(36).substring(2, 15);
}
```
📌 **Why This Matters?**  
✅ Ensures every request **can be tracked**, even if no request ID is provided.  
✅ Helps in **troubleshooting logs** for a particular request.

---

# 🔥 **Summary of LoggerService Features**
| Feature | Description |
|---------|-------------|
| **Console Logging** | ✅ Logs messages to the terminal for debugging. |
| **File Logging (Daily Rotation)** | ✅ Stores logs in daily files (`logs/app-YYYY-MM-DD.log`). |
| **Elasticsearch Logging** | ✅ Sends logs to Elasticsearch for **searching & visualization in Kibana**. |
| **Structured Logging** | ✅ Logs contain timestamps, request details, and metadata. |
| **Error Handling** | ✅ Supports logging errors with **stack traces**. |
| **Request Tracking** | ✅ Associates logs with HTTP requests (**IP, method, URL, request ID**). |

---

# 🚀 **How to Use `LoggerService` in Your NestJS App**
### ➤ **1️⃣ Inject LoggerService in Any Service**
```ts
import { Injectable } from '@nestjs/common';
import { LoggerService } from './logging/logger.service';

@Injectable()
export class UserService {
  constructor(private readonly logger: LoggerService) {}

  loginUser(userId: string) {
    this.logger.log('User login successful', { userId });
  }
}
```

### ➤ **2️⃣ Log Errors When Something Fails**
```ts
try {
  throw new Error('Database connection failed');
} catch (error) {
  this.logger.error('Database error', error, { service: 'UserService' });
}
```

### ➤ **3️⃣ Log Requests in Middleware**
```ts
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { LoggerService } from './logging/logger.service';

@Injectable()
export class LoggingMiddleware implements NestMiddleware {
  constructor(private readonly logger: LoggerService) {}

  use(req: Request, res: Response, next: NextFunction) {
    this.logger.setRequest(req);
    this.logger.log(`Incoming request: ${req.method} ${req.originalUrl}`);
    next();
  }
}
```
📌 **Why This Is Useful?**  
✅ Automatically logs every API request, tracking **IP, method, and request ID**.

---

# 🎯 **Final Thoughts**
✅ **`LoggerService` provides a powerful, structured, and centralized logging system.**  
✅ **Logs are stored in files, displayed in the console, and searchable in Elasticsearch via Kibana.**  
✅ **Supports tracking HTTP requests, error logging, and log rotation.**

----

