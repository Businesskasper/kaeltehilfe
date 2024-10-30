import { downloadBase64, getBaseGet, toDate, useCrudHook } from "../utils";

export type LoginCertificate = {
  id: number;
  thumbprint: string;
  description?: string;
  validFrom?: Date;
  validTo?: Date;
  loginUsername: string;
};

export type LoginCertificateContent = {
  fileName: string;
  encodedCertChain: string;
};

export type LoginCertificatePost = {
  description?: string;
  loginUsername: string;
  pfxPassword: string;
};

export type LoginCertificatePostResult = {
  fileName: string;
  encodedCertChain: string;
};

export const useLoginCertificates = () =>
  useCrudHook<
    LoginCertificate,
    never,
    LoginCertificatePost,
    never,
    LoginCertificatePostResult
  >({
    key: "loginCertificates",
    transformer: { validFrom: toDate, validTo: toDate },
  });

export const fetchCertificateContent = (cert: LoginCertificate) =>
  getBaseGet<LoginCertificateContent>(
    `/loginCertificates/${cert.id}/content`
  )().then((result) =>
    downloadBase64(
      `${cert.loginUsername}_${result.fileName}`,
      result.encodedCertChain,
      "application/x-pkcs12"
    )
  );
