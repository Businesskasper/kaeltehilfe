import { Button, Group, Stack, Text, Title } from "@mantine/core";
import { getKcClsx } from "keycloakify/login/lib/kcClsx";
import type { PageProps } from "keycloakify/login/pages/PageProps";
import type { KcContext } from "../KcContext";
import type { I18n } from "../i18n";

import "./login.css";

export default function LoginX509Info(props: PageProps<Extract<KcContext, { pageId: "login-x509-info.ftl" }>, I18n>) {
    const { kcContext, i18n, doUseDefaultCss, Template, classes } = props;

    const { kcClsx } = getKcClsx({
        doUseDefaultCss,
        classes
    });

    const { url, x509 } = kcContext;

    const { msg, msgStr } = i18n;

    return (
        <Template kcContext={kcContext} i18n={i18n} doUseDefaultCss={doUseDefaultCss} classes={classes} headerNode={msg("doLogIn")}>
            <form id="kc-x509-login-info" className={kcClsx("kcFormClass")} action={url.loginAction} method="post">
                <Stack gap="xs" py="sm">
                    <Text>{msg("clientCertificate")}</Text>
                    <Title order={6}>{x509.formData.subjectDN || msg("noCertificate")}</Title>
                </Stack>

                {x509.formData.isUserEnabled && (
                    <Stack gap="xs" py="sm">
                        <Text> {msg("doX509Login")}</Text>
                        <Title order={2}> {x509.formData.username}</Title>
                    </Stack>
                )}

                <Group py="md" wrap="nowrap" w="100%" justify="center" align="center">
                    <Button fullWidth name="login" id="kc-login" type="submit" variant="filled">
                        {msgStr("doContinue")}
                    </Button>
                    {x509.formData.isUserEnabled && (
                        <Button fullWidth variant="outline" name="cancel" id="kc-cancel" type="submit">
                            {msgStr("doIgnore")}
                        </Button>
                    )}
                </Group>
            </form>
        </Template>
    );
}
