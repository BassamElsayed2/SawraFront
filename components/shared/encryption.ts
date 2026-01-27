import CryptoJS from 'crypto-js';


export const encryptData = (data: any) => {
  const jsonString = JSON.stringify(data)
  const utf8String = unescape(encodeURIComponent(jsonString))
  const encodedString = btoa(utf8String)
  const textBefore = encodedString.substr(0, 15)
  const textAfter = encodedString.substr(15)

  return textBefore + '2w2rds23dash34sd5dsd65tf51hj20hj1874' + textAfter
}

export const decryptData = (encodedData: string) => {
  try {
    const endCode = encodedData.replace('2w2rds23dash34sd5dsd65tf51hj20hj1874', '')
    const utf8String = atob(endCode)
    const jsonString = decodeURIComponent(escape(utf8String))

    return JSON.parse(jsonString)
  } catch {
    return {}
  }
}




export function encryptDataApi(data: any, passphrase: string) {
  const jsonString = JSON.stringify(data);
  const encrypted = CryptoJS.AES.encrypt(jsonString, passphrase);
  
  return encrypted.toString();
}

export function decryptDataApi(encryptedData: string, passphrase: string) {

  const bytes = CryptoJS.AES.decrypt(encryptedData, passphrase);
  const decryptedString = bytes.toString(CryptoJS.enc.Utf8); 

  try {
    return JSON.parse(decryptedString);
  } catch {
    return decryptedString;
  }
}