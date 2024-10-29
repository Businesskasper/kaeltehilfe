import { downloadBase64, getBaseGet, toDate, useCrudHook } from "../utils";

export type LoginCertificate = {
  thumbprint: string;
  validFrom?: Date;
  validTo?: Date;
  loginUsername: string;
};

export type LoginCertificateContent = {
  encodedContent: string;
};

export type LoginCertificatePost = {
  loginUsername: string;
  pfxPassword: string;
};

export const useLoginCertificates = () =>
  useCrudHook<LoginCertificate, never, LoginCertificatePost, never>({
    key: "loginCertificates",
    transformer: { validFrom: toDate, validTo: toDate },
  });

export const fetchCertificateContent = (cert: LoginCertificate) =>
  getBaseGet<LoginCertificateContent>(
    `/loginCertificates/${cert.thumbprint}/content`
  )().then((result) =>
    downloadBase64(
      `${cert.thumbprint}.pfx`,
      result.encodedContent,
      "application/x-pkcs12"
    )
  );
