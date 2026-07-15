# Audit Logging Contract

This document defines the mandatory fields and structure required for DPDP Act compliant audit logging across all Bare Minimum admin mutation routes.

## The Middleware

All mutating requests (`POST`, `PUT`, `DELETE`, `PATCH`) handled by the `admin.routes.js` router pass through `adminAudit` middleware. The middleware automatically logs the request and response data upon a successful HTTP status code (2xx).

## Mandatory Metadata (`req.audit`)

To prevent the middleware from logging generic or incomplete data, every handler that performs a database mutation MUST attach an `audit` object to the Express `req` object:

```javascript
req.audit = {
  action: 'UPDATE_ORDER_STATUS', // Required: A SCREAMING_SNAKE_CASE string describing the action
  resource: 'Order:12345', // Required: The EntityType:EntityId that was mutated
  details: {
    // Optional but recommended: Specific fields that changed
    status: 'SHIPPED',
    previousStatus: 'CONFIRMED'
  }
};
```

### Inferred Fields

The middleware automatically handles the following fields, so you do NOT need to provide them in `req.audit`:

- **`adminId`**: Extracted from the JWT via `req.user.id`.
- **`ipAddress`**: Extracted from the request headers/connection.
- **`timestamp`**: Automatically set by Prisma upon creation.
- **`before/after` Diffing**: If `details` isn't provided, the middleware will stringify `req.body` and the response JSON into the audit log.

## CI Enforcement

A continuous integration script (`scripts/audit-ci-check.sh`) scans the codebase. If it detects a `prisma` mutation method (`create`, `update`, `delete`, `upsert`) inside an admin route, it will FAIL the build if `req.audit =` is not also present in that route.
