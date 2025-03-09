# 📜 **How to Feed Logs into LoggerService (Generic Examples)**

## 🎯 **Overview**
To log messages in your NestJS application, **inject `LoggerService`** and call its methods (`log()`, `warn()`, `error()`, etc.).

✅ Works in **controllers, services, middleware, and interceptors**.  
✅ Supports **metadata** (extra information).  
✅ Automatically **tracks request details** (if middleware is applied).

---

# 📌 **1️⃣ Basic Logging in a Service**
### **Logging in a NestJS Service**
```ts
import { Injectable } from '@nestjs/common';
import { LoggingService } from './logging/logger.service';

@Injectable()
export class UserService {
  constructor(private readonly logger: LoggingService) {}

  loginUser(userId: string) {
    this.logger.log('User login successful', { userId });
  }

  logoutUser(userId: string) {
    this.logger.warn('User logged out', { userId });
  }

  deleteUser(userId: string) {
    this.logger.error('User deletion failed', new Error('Database error'), { userId });
  }
}
```
📌 **What Happens?**  
1️⃣ **Logs "User login successful"** → `info` level (normal log).  
2️⃣ **Logs "User logged out"** → `warn` level (warning).  
3️⃣ **Logs "User deletion failed"** → `error` level (includes stack trace).

---

# 📌 **2️⃣ Logging in a Controller**
### **Logging HTTP Requests Inside a Controller**
```ts
import { Controller, Get, Post, Param } from '@nestjs/common';
import { LoggingService } from './logging/logger.service';

@Controller('users')
export class UserController {
  constructor(private readonly logger: LoggingService) {}

  @Get(':id')
  getUser(@Param('id') id: string) {
    this.logger.log(`Fetching user data`, { userId: id });
    return { message: 'User data retrieved', userId: id };
  }

  @Post(':id/delete')
  deleteUser(@Param('id') id: string) {
    this.logger.warn(`Deleting user`, { userId: id });
    throw new Error('Delete operation failed');
  }
}
```
📌 **What Happens?**  
✔ Logs `"Fetching user data"` when `GET /users/:id` is called.  
✔ Logs `"Deleting user"` when `POST /users/:id/delete` is called.  
✔ The `deleteUser()` method **throws an error**, which should be caught using `try/catch`.

---

# 📌 **3️⃣ Logging in Middleware (Automatically Logs Requests)**
### **Middleware That Logs All Requests**
```ts
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { LoggingService } from '../logging/logger.service';

@Injectable()
export class LoggingMiddleware implements NestMiddleware {
  constructor(private readonly logger: LoggingService) {}

  use(req: Request, res: Response, next: NextFunction): void {
    const startTime = Date.now();
    this.logger.setRequest(req);

    res.on('finish', () => {
      const duration = Date.now() - startTime;
      this.logger.log(`HTTP ${req.method} ${req.url} - ${res.statusCode} (${duration}ms)`, {
        method: req.method,
        url: req.url,
        status: res.statusCode,
        duration: `${duration}ms`,
        userAgent: req.headers['user-agent'],
        ip: req.ip,
      });
    });

    next();
  }
}
```
📌 **What Happens?**  
✔ Captures **HTTP method, URL, status code, duration, IP, and user-agent**.  
✔ Automatically **logs all incoming requests**.

---

# 📌 **4️⃣ Logging in Exception Filters (Captures All Errors)**
### **Global Exception Logger**
```ts
import { ExceptionFilter, Catch, ArgumentsHost, HttpException } from '@nestjs/common';
import { LoggingService } from '../logging/logger.service';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: LoggingService) {}

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();
    
    const status = exception.getStatus ? exception.getStatus() : 500;
    const message = exception.message || 'Internal server error';

    this.logger.error('Unhandled exception occurred', exception, {
      method: request.method,
      url: request.url,
      status,
      requestId: request.headers['x-request-id'],
    });

    response.status(status).json({ statusCode: status, message });
  }
}
```
📌 **What Happens?**  
✔ Catches **all unhandled errors**.  
✔ Logs **HTTP request details + error stack trace**.

---

# 📌 **5️⃣ Logging in Interceptors (For Response Time & Profiling)**
### **Logging Response Time for Performance Monitoring**
```ts
import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { LoggingService } from '../logging/logger.service';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private readonly logger: LoggingService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const startTime = Date.now();

    return next.handle().pipe(
      tap(() => {
        const duration = Date.now() - startTime;
        this.logger.log(`Response time: ${duration}ms`, {
          method: request.method,
          url: request.url,
          duration: `${duration}ms`,
        });
      }),
    );
  }
}
```
📌 **What Happens?**  
✔ Captures **response time** for every request.  
✔ Helps in **performance monitoring**.

---

# 📌 **6️⃣ Logging in a CLI Command or Worker Process**
### **Logging in Background Jobs**
```ts
import { Command } from 'nestjs-command';
import { Injectable } from '@nestjs/common';
import { LoggingService } from '../logging/logger.service';

@Injectable()
export class DataSyncJob {
  constructor(private readonly logger: LoggingService) {}

  @Command({ command: 'sync:data', describe: 'Synchronize data from external API' })
  async sync() {
    this.logger.log('Starting data synchronization...');
    
    try {
      // Simulating a sync operation
      await new Promise((resolve) => setTimeout(resolve, 2000));
      this.logger.log('Data synchronization completed successfully.');
    } catch (error) {
      this.logger.error('Data synchronization failed', error);
    }
  }
}
```
📌 **What Happens?**  
✔ Logs **start and completion** of background jobs.  
✔ Catches **errors if sync fails**.

---

# 🎯 **How the Logs Will Look Like**
| **Logging Action** | **Example Log Output** |
|------------------|------------------|
| **User logs in** | `{ "timestamp": "2025-03-15T10:30:00Z", "level": "info", "message": "User login successful", "userId": "123" }` |
| **API request logging** | `{ "timestamp": "2025-03-15T10:30:10Z", "level": "info", "message": "HTTP GET /users/123 - 200 (45ms)", "method": "GET", "url": "/users/123", "status": 200, "duration": "45ms", "ip": "192.168.1.1" }` |
| **Error logging** | `{ "timestamp": "2025-03-15T10:31:00Z", "level": "error", "message": "Database error", "service": "UserService", "error": "Error: Connection failed\n at DatabaseService.query..." }` |

---

# 🚀 **Final Takeaway**
✅ **LoggerService** can be used in **services, controllers, middleware, interceptors, exception filters, and CLI commands**.  
✅ Automatically logs **HTTP requests, errors, and background jobs**.  
✅ Logs contain **structured metadata** (request ID, IP, user-agent, stack traces).  
✅ Logs are stored in **console, files, and Elasticsearch (for Kibana analysis)**.

