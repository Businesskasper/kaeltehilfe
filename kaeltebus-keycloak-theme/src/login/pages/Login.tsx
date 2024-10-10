import { kcSanitize } from "keycloakify/lib/kcSanitize";
import { getKcClsx } from "keycloakify/login/lib/kcClsx";
import type { PageProps } from "keycloakify/login/pages/PageProps";
import { useState } from "react";
import type { KcContext } from "../KcContext";
import type { I18n } from "../i18n";

import { Anchor, Button, Card, Checkbox, Divider, Group, PasswordInput, Stack, Text, TextInput } from "@mantine/core";
import { clsx } from "keycloakify/tools/clsx";
import "./login.css";

export default function Login(props: PageProps<Extract<KcContext, { pageId: "login.ftl" }>, I18n>) {
    const { kcContext, i18n, doUseDefaultCss, Template, classes } = props;

    const { kcClsx } = getKcClsx({
        doUseDefaultCss,
        classes
    });

    const { social, realm, url, usernameHidden, login, auth, registrationDisabled, messagesPerField } = kcContext;

    const { msg, msgStr } = i18n;

    const [isLoginButtonDisabled, setIsLoginButtonDisabled] = useState(false);

    return (
        <Template
            kcContext={kcContext}
            i18n={i18n}
            doUseDefaultCss={doUseDefaultCss}
            classes={classes}
            displayMessage={!messagesPerField.existsError("username", "password")}
            headerNode={msg("loginAccountTitle")}
            displayInfo={realm.password && realm.registrationAllowed && !registrationDisabled}
            infoNode={
                <Card.Section withBorder inheritPadding py="xl">
                    <Group justify="center" align="center" gap="xs">
                        <Text>{msg("noAccount")}</Text>
                        <Anchor tabIndex={8} href={url.registrationUrl}>
                            {msg("doRegister")}
                        </Anchor>
                    </Group>
                </Card.Section>
            }
            socialProvidersNode={
                <>
                    {realm.password && social?.providers !== undefined && social.providers.length !== 0 && (
                        <div className="social-providers">
                            <Group w="100%" justify="center" my="sm">
                                <Text>{msg("identity-provider-login-label")}</Text>
                            </Group>
                            <Divider />
                            <Group mt="sm" mb="sm" justify="space-evenly">
                                {social.providers.map((...[p]) => (
                                    <Button key={p.alias} variant="subtle" fullWidth style={{ flexBasis: "150px" }} component="a" href={p.loginUrl}>
                                        <i className={clsx(kcClsx("kcCommonLogoIdP"), p.iconClasses)} aria-hidden="true"></i>{" "}
                                        {kcSanitize(p.displayName)}
                                    </Button>
                                ))}
                            </Group>
                        </div>
                    )}
                </>
            }
        >
            {realm.password && (
                <form
                    id="kc-form-login"
                    onSubmit={() => {
                        setIsLoginButtonDisabled(true);
                        return true;
                    }}
                    action={url.loginAction}
                    method="post"
                >
                    {!usernameHidden && (
                        <TextInput
                            my="sm"
                            tabIndex={2}
                            label={
                                !realm.loginWithEmailAllowed
                                    ? msg("username")
                                    : !realm.registrationEmailAsUsername
                                      ? msg("usernameOrEmail")
                                      : msg("email")
                            }
                            name="username"
                            defaultValue={login.username ?? ""}
                            autoFocus
                            autoComplete="username"
                            aria-invalid={messagesPerField.existsError("username", "password")}
                            error={messagesPerField.getFirstError("username", "password")}
                        />
                    )}

                    <PasswordInput
                        my="sm"
                        label={msg("password")}
                        tabIndex={3}
                        id="password"
                        name="password"
                        type="password"
                        autoComplete="current-password"
                        aria-invalid={messagesPerField.existsError("username", "password")}
                        error={usernameHidden ? messagesPerField.getFirstError("username", "password") : ""}
                    />

                    {realm.rememberMe && !usernameHidden && (
                        <Checkbox
                            my="sm"
                            label={msg("rememberMe")}
                            tabIndex={5}
                            id="rememberMe"
                            name="rememberMe"
                            defaultChecked={!!login.rememberMe}
                        />
                    )}

                    <Stack mt="lg" justify="flex-start">
                        {realm.resetPasswordAllowed && (
                            <Anchor tabIndex={6} href={url.loginResetCredentialsUrl}>
                                {msg("doForgotPassword")}
                            </Anchor>
                        )}
                        <input style={{ display: "block" }} type="hidden" id="id-hidden-input" name="credentialId" value={auth.selectedCredential} />
                        <Button fullWidth tabIndex={7} disabled={isLoginButtonDisabled} name="login" type="submit">
                            {msgStr("doLogIn")}
                        </Button>
                    </Stack>
                </form>
            )}
        </Template>
    );
}
