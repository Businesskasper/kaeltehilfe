import { Anchor, Card, Group, Notification, Title, Tooltip, rem, useMantineColorScheme } from "@mantine/core";
import { IconCheck, IconExclamationMark, IconInfoCircle, IconRestore, IconX } from "@tabler/icons-react";
import { kcSanitize } from "keycloakify/lib/kcSanitize";
import { useInitialize } from "keycloakify/login/Template.useInitialize";
import type { TemplateProps } from "keycloakify/login/TemplateProps";
import { getKcClsx } from "keycloakify/login/lib/kcClsx";
import { clsx } from "keycloakify/tools/clsx";
import { useSetClassName } from "keycloakify/tools/useSetClassName";
import React, { useEffect } from "react";
import type { KcContext } from "./KcContext";
import type { I18n } from "./i18n";

import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";
import "@mantine/notifications/styles.css";

import "./template.css";

export default function Template(props: TemplateProps<KcContext, I18n>) {
    const {
        displayInfo = false,
        displayMessage = true,
        displayRequiredFields = false,
        headerNode,
        socialProvidersNode = null,
        infoNode = null,
        documentTitle,
        bodyClassName,
        kcContext,
        i18n,
        doUseDefaultCss,
        classes,
        children
    } = props;

    // Set color scheme from client provided url parameter
    const urlParams = new URLSearchParams(window.location.search);
    const clientTheme = urlParams.get("theme");
    const { setColorScheme } = useMantineColorScheme();
    React.useEffect(() => {
        if (clientTheme !== "dark" && clientTheme !== "light") return;
        setColorScheme(clientTheme);
    }, [setColorScheme, clientTheme]);

    const { kcClsx } = getKcClsx({ doUseDefaultCss, classes });

    const { msg, msgStr } = i18n;

    const { auth, url, message, isAppInitiatedAction } = kcContext;

    useEffect(() => {
        document.title = documentTitle ?? msgStr("loginTitle", kcContext.realm.displayName);
    }, []);

    // useEffect(() => {
    //     if (!(displayMessage && message !== undefined && (message.type !== "warning" || !isAppInitiatedAction))) {
    //         notifications.clean();
    //         return;
    //     }

    //     const notification: NotificationData = {
    //         message: kcSanitize(message.summary),
    //         withBorder: true,
    //         withCloseButton: false,
    //         w: "100%",
    //         my: "sm",
    //         autoClose: false
    //     };

    //     if (message.type === "error") {
    //         notification.icon = <IconX style={{ width: rem(20), height: rem(20) }} />;
    //         notification.color = "red";
    //     } else if (message.type === "warning") {
    //         notification.icon = <IconExclamationMark style={{ width: rem(20), height: rem(20) }} />;
    //         notification.color = "orange";
    //     } else if (message.type === "info") {
    //         notification.icon = <IconInfoCircle style={{ width: rem(20), height: rem(20) }} />;
    //         notification.color = "blue";
    //     } else if (message.type === "success") {
    //         notification.icon = <IconCheck style={{ width: rem(20), height: rem(20) }} />;
    //         notification.color = "blue";
    //     }

    //     notifications.show(notification);
    // }, [message?.summary, displayMessage, currentLanguage]);

    useSetClassName({
        qualifiedName: "html",
        className: kcClsx("kcHtmlClass")
    });

    useSetClassName({
        qualifiedName: "body",
        className: bodyClassName ?? kcClsx("kcBodyClass")
    });

    const { isReadyToRender } = useInitialize({ kcContext, doUseDefaultCss });

    if (!isReadyToRender) {
        return null;
    }

    const titleNode = (
        <Title order={4}>
            {!(auth !== undefined && auth.showUsername && !auth.showResetCredentials) ? (
                headerNode
            ) : (
                <Group justify="center" align="flex-start" gap="sm">
                    <span>{auth.attemptedUsername}</span>
                    <Tooltip label={msg("restartLoginTooltip")}>
                        <Anchor href={url.loginRestartFlowUrl} aria-label={msgStr("restartLoginTooltip")}>
                            <IconRestore />
                        </Anchor>
                    </Tooltip>
                </Group>
            )}
        </Title>
    );

    return (
        <Card w="400px" padding="md" radius="md" withBorder>
            <Card.Section withBorder inheritPadding py="md">
                {displayRequiredFields ? (
                    <div className={kcClsx("kcContentWrapperClass")}>
                        <div className={clsx(kcClsx("kcLabelWrapperClass"), "subtitle")}>
                            <span className="subtitle">
                                <span className="required">*</span>
                                {msg("requiredFields")}
                            </span>
                        </div>
                        <div className="col-md-10">{titleNode}</div>
                    </div>
                ) : (
                    titleNode
                )}
            </Card.Section>
            {displayMessage && message !== undefined && (message.type !== "warning" || !isAppInitiatedAction) && (
                <>
                    {message.type === "error" && (
                        <Notification
                            withCloseButton={false}
                            withBorder
                            w="100%"
                            my="sm"
                            icon={<IconX style={{ width: rem(20), height: rem(20) }} />}
                            color="red"
                        >
                            {kcSanitize(message.summary)}
                        </Notification>
                    )}
                    {message.type === "info" && (
                        <Notification
                            withCloseButton={false}
                            withBorder
                            w="100%"
                            my="sm"
                            icon={<IconInfoCircle style={{ width: rem(20), height: rem(20) }} />}
                            color="blue"
                        >
                            {kcSanitize(message.summary)}
                        </Notification>
                    )}
                    {message.type === "success" && (
                        <Notification
                            withCloseButton={false}
                            withBorder
                            w="100%"
                            my="sm"
                            icon={<IconCheck style={{ width: rem(20), height: rem(20) }} />}
                            color="blue"
                        >
                            {kcSanitize(message.summary)}
                        </Notification>
                    )}
                    {message.type === "warning" && (
                        <Notification
                            withCloseButton={false}
                            withBorder
                            w="100%"
                            my="sm"
                            icon={<IconExclamationMark style={{ width: rem(20), height: rem(20) }} />}
                            color="orange"
                        >
                            {kcSanitize(message.summary)}
                        </Notification>
                    )}
                </>
            )}
            {children}
            {auth !== undefined && auth.showTryAnotherWayLink && (
                <form id="kc-select-try-another-way-form" action={url.loginAction} method="post">
                    <div className={kcClsx("kcFormGroupClass")}>
                        <input type="hidden" name="tryAnotherWay" value="on" />
                        <a
                            href="#"
                            id="try-another-way"
                            onClick={() => {
                                document.forms["kc-select-try-another-way-form" as never].submit();
                                return false;
                            }}
                        >
                            {msg("doTryAnotherWay")}
                        </a>
                    </div>
                </form>
            )}
            {socialProvidersNode}
            {displayInfo && (
                <div id="kc-info" className={kcClsx("kcSignUpClass")}>
                    <div id="kc-info-wrapper" className={kcClsx("kcInfoAreaWrapperClass")}>
                        {infoNode}
                    </div>
                </div>
            )}
        </Card>
    );
}
