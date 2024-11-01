import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  downloadBase64,
  getBaseGet,
  http,
  toDate,
  useCrudHook,
} from "../utils";

export type LoginCertificate = {
  id: number;
  thumbprint: string;
  description?: string;
  validFrom?: Date;
  validTo?: Date;
  loginUsername: string;
  status: CertificateStatus;
};

export type CertificateStatus = "ACTIVE" | "REVOKED";

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

const revokeCertificate = (id: number) =>
  http.post(`/loginCertificates/${id}/revocation`, null);
export const useRevokeLoginCertificate = () => {
  const queryClient = useQueryClient();

  return useMutation<unknown, Error, { id: number }>({
    mutationFn: ({ id }) => revokeCertificate(id),
    onSettled: () =>
      queryClient.invalidateQueries({
        queryKey: ["loginCertificates"],
        refetchType: "all",
        stale: true,
        type: "all",
      }),
  });
};
