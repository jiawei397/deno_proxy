export function transUrl(originUrl: string, baseUrl: string) {
  const last = originUrl.replace(/:\/\//, "/");
  console.log(last);
  return `${baseUrl.endsWith("/") ? baseUrl : baseUrl + "/"}${last}`;
}
