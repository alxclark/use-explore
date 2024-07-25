/* eslint-disable @typescript-eslint/no-explicit-any */
import { Suspense, use } from "react";
import "./App.css";

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(() => resolve(42), ms));
}

const loader: Record<any, string | Promise<string>> = {
  name: "alex",
  alias: "alx",
  lifePurpose: sleep(1000).then(() => "enjoy life"),
};

function createForm() {
  const record: any = {};

  const handler: ProxyHandler<any> = {
    get(_, prop) {
      if (typeof prop === "symbol") return;

      // Return field that were accessed once before
      if (prop in record) {
        return record[prop];
      }

      // Create field from the loader AND
      // conditionally unwraps it with suspense if its a promise
      if (prop in loader) {
        if (loader[prop] instanceof Promise) {
          return use(loader[prop]);
        }
        return loader[prop];
      }

      return "unknown";
    },
  };

  const fields = new Proxy(record, handler);

  return {
    get fields() {
      return fields;
    },
  };
}

export default function App() {
  const form = createForm();

  return (
    <div>
      <Suspense fallback={<div>Loading...</div>}>
        <Component form={form} field="name" />
      </Suspense>
      <Suspense fallback={<div>Loading...</div>}>
        <Component form={form} field="alias" />
      </Suspense>
      <Suspense fallback={<div>Loading...</div>}>
        <Component form={form} field="lifePurpose" />
      </Suspense>
    </div>
  );
}

function Component({
  form,
  field,
}: {
  form: ReturnType<typeof createForm>;
  field: keyof typeof loader;
}) {
  return (
    <div>
      {field}: {form.fields[field]}
    </div>
  );
}

// @types does not include versions of canary releases of react and react-dom
declare module "react" {
  function use<T>(promise: Promise<T>): T;
}
