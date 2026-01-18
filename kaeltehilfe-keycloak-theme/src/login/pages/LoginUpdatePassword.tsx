import { Button, Checkbox, Group, PasswordInput } from "@mantine/core";
import type { PageProps } from "keycloakify/login/pages/PageProps";
import type { KcContext } from "../KcContext";
import type { I18n } from "../i18n";

import "./login.css";

export default function LoginUpdatePassword(props: PageProps<Extract<KcContext, { pageId: "login-update-password.ftl" }>, I18n>) {
    const { kcContext, i18n, doUseDefaultCss, Template, classes } = props;

    const { msg, msgStr } = i18n;

    const { url, messagesPerField, isAppInitiatedAction } = kcContext;

    return (
        <Template
            kcContext={kcContext}
            i18n={i18n}
            doUseDefaultCss={doUseDefaultCss}
            classes={classes}
            displayMessage={!messagesPerField.existsError("password", "password-confirm")}
            headerNode={msg("updatePasswordTitle")}
        >
            <form id="kc-passwd-update-form" action={url.loginAction} method="post">
                <PasswordInput
                    my="sm"
                    label={msg("passwordNew")}
                    tabIndex={3}
                    id="password-new"
                    name="password-new"
                    type="password"
                    autoComplete="password-new"
                    autoFocus
                    aria-invalid={messagesPerField.existsError("password", "password-confirm")}
                    error={messagesPerField.getFirstError("password", "password-confirm")}
                />

                <PasswordInput
                    my="sm"
                    label={msg("passwordConfirm")}
                    tabIndex={3}
                    id="password-confirm"
                    name="password-confirm"
                    type="password"
                    autoComplete="password-confirm"
                    autoFocus
                    aria-invalid={messagesPerField.existsError("password", "password-confirm")}
                    error={messagesPerField.getFirstError("password-confirm")}
                />

                <Group my="sm">
                    <Checkbox label={msg("logoutOtherSessions")} id="logout-sessions" name="logout-sessions" value="on" defaultChecked={true} />
                </Group>

                <Group wrap="nowrap" w="100%">
                    {isAppInitiatedAction && (
                        <Button w="100%" type="submit" value="true" name="cancel-aia" color="red" variant="outline">
                            {msgStr("doCancel")}
                        </Button>
                    )}
                    <Button w="100%" type="submit">
                        {msgStr("doSubmit")}
                    </Button>
                </Group>
            </form>
        </Template>
    );
}
