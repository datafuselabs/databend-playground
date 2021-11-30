export function showInfo(error: any): void {
  console.log('error info: ', error);
}
export function copyToClipboard(textToCopy: string) {
  if (navigator.clipboard && window.isSecureContext) {
    // secure
    return navigator.clipboard.writeText(textToCopy);
  } else {
    // non-secure
    let textArea: HTMLTextAreaElement = document.createElement("textarea");
    textArea.value = textToCopy;
    textArea.style.position = "absolute";
    textArea.style.opacity = '0';
    textArea.style.left = "-999999px";
    textArea.style.top = "-999999px";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    return new Promise<void>((res, rej) => {
      document.execCommand('copy') ? res() : rej();
      textArea.remove();
    });
  }
}