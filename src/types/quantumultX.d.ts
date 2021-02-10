type ScriptType =
  | "request-header"
  | "request-body"
  | "response-header"
  | "response-body"
  | "echo-response"
  | "analyze-echo-response";

type QuanXRequest = {
  scheme: string;
  method: "GET" | "POST" | "PATCH" | "PUT" | "DELETE" | "HEAD";
  url: string;
  path: string;
  headers: {
    [prop: string]: any;
  };
};

type QuanXResponse = {
  /**
   *  HTTP/1.1 200 OK
   */
  status: string;
  statusCode: number;
  headers: {
    [prop: string]: any;
  };
  body: string;
  bodyBytes: ArrayBuffer;
};

declare const $request: QuanXRequest;

declare const $response: QuanXResponse;

declare function $done(response?: Partial<QuanXResponse>): void;

declare function $notify(title: string, subTitle?: string, content?: string): void;

declare namespace $task {
  function fetch<T extends QuanXResponse>(request: Partial<QuanXRequest>): Promise<T>;
}

declare namespace $prefs {
  function setValueForKey(value: string, key: string): boolean;
  function removeValueForKey(key: string): boolean;
  function removeAllValues(): boolean;
  function valueForKey(key: string): ?string;
}
