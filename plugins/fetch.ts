export default defineNuxtPlugin(() => {
  let config: RequestInit = {
    mode: 'no-cors',
    headers: {
      'Content-Type': 'application/json'
    },
  }
  return {
    provide: {
      setDefaults: (option: RequestInit): void => {
        config = { ...config, ...option, headers: { ...option.headers, 'Content-Type': 'application/json' } }
      },
      fetch: (url: string, method: string, body?: string | FormData): Promise<Response> => {
        const option: RequestInit = {
          ...config,
          method,
          body,
        }
        if (body && body instanceof FormData) option.headers = {
          ...option.headers,
          'Content-Type': ''
        }

        return fetch(url, option)
      }
    }
  }
})