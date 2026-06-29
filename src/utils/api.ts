export function getApiUrl(endpoint: string): string {
  // Ensure the endpoint starts with a slash
  const formattedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  
  // Detect if we are running in a subfolder environment (like /bo on srrejvi.com)
  const pathname = window.location.pathname;
  if (pathname.startsWith('/bo')) {
    return `/bo${formattedEndpoint}`;
  }
  return formattedEndpoint;
}
