export type SecurityRuleContext = {
  path: string;
  operation: 'get' | 'list' | 'create' | 'update' | 'delete' | 'write';
  requestResourceData?: any;
};

export class FirestorePermissionError extends Error {
  public readonly context: SecurityRuleContext;

  constructor(context: SecurityRuleContext) {
    const message = `Firestore Permission Denied: Cannot ${context.operation} on ${context.path}.`;
    super(message);
    this.name = 'FirestorePermissionError';
    this.context = context;
    Object.setPrototypeOf(this, FirestorePermissionError.prototype);
  }

  public toString(): string {
    let output = `Missing or insufficient permissions. The following request was denied by Firestore Security Rules:\n`;
    output += JSON.stringify(
      {
        operation: this.context.operation,
        path: this.context.path,
        ...(this.context.requestResourceData && {
          requestData: this.context.requestResourceData,
        }),
      },
      null,
      2
    );
    return output;
  }
}
