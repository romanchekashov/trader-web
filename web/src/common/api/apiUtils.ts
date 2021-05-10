export async function handleResponse(response: any) {
  if (response.ok) return response.json();
  if (response.status === 400) {
    // So, a server-side validation error occurred.
    // Server side validation returns a string error message, so parse as text instead of json.
    const error = await response.text();
    throw new Error(error);
  }
  throw new Error("Network response was not ok.");
}

// In a real app, would likely call an error logging service.
export function handleError(error: any) {
  // eslint-disable-next-line no-console
  console.error("API call failed. " + error);
  throw error;
}

export function get<T>(url: string): Promise<T> {
  return fetch(url, {
    method: "GET",
    headers: { "content-type": "application/json" },
  })
    .then((response) => handleResponse(response))
    .catch(handleError);
}

export function del<T>(url: string): Promise<T> {
  return fetch(url, {
    method: "DELETE",
    headers: { "content-type": "application/json" },
  })
    .then((response) => handleResponse(response))
    .catch(handleError);
}

/**
 * How to create TS generics:
 * 1 - function foo<T>(x: T): T { return x; }
 * 2 - const foo = <T extends unknown>(x: T) => x;
 *
 * @param url
 * @param json
 * @returns
 */
export const post = <T extends unknown>(url: string, json: any): Promise<T> =>
  fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(json),
  })
    .then((response) => handleResponse(response))
    .catch(handleError);
