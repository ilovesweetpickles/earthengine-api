import {Serializable, serialize} from './domain_object';
import {GeneratedRequestParams} from './generated_types';
import {MultipartRequest} from './multipart_request';
import {MakeRequestParams} from './request_params';

export abstract class ApiClient {
  // tslint:disable-next-line:no-any
  $validateParameter(param: any, pattern: RegExp): void {
    const paramStr = String(param);
    if (!pattern.test(paramStr)) {
      throw new Error(
          `parameter [${paramStr}] does not match pattern [${
                                                             pattern.toString()
                                                           }]`);
    }
  }
}

export function toMakeRequestParams(requestParams: GeneratedRequestParams):
    MakeRequestParams {
  const body = (requestParams.body instanceof Serializable) ?
      serialize(requestParams.body) :
      requestParams.body;
  return {
    path: requestParams.path,
    httpMethod: requestParams.httpMethod,
    methodId: requestParams.methodId,
    body: body as Serializable,
    queryParams: requestParams.queryParams
  } as MakeRequestParams;
}

export function toMultipartMakeRequestParams(
    requestParams: GeneratedRequestParams): Promise<MakeRequestParams> {
  if (!(requestParams.body instanceof MultipartRequest)) {
    throw new Error(`${requestParams.path} request must be a MultipartRequest`);
  }

  const multipartRequest = requestParams.body;
  return multipartRequest.payloadPromise.then(body => {
    return {
      path: requestParams.path,
      httpMethod: requestParams.httpMethod,
      methodId: requestParams.methodId,
      queryParams: {'uploadType': 'multipart'},
      headers: {
        'X-Goog-Upload-Protocol': 'multipart',
        'Content-Type':
            `multipart/related; boundary=${multipartRequest.boundary}`
      },
      body,
    };
  });
}
