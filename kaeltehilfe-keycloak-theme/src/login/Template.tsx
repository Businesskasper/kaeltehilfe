import { Anchor, Card, Group, Notification, Title, Tooltip, rem, useMantineColorScheme } from "@mantine/core";
import { IconCheck, IconExclamationMark, IconInfoCircle, IconRestore, IconX } from "@tabler/icons-react";
import { kcSanitize } from "keycloakify/lib/kcSanitize";
import { useInitialize } from "keycloakify/login/Template.useInitialize";
import type { TemplateProps } from "keycloakify/login/TemplateProps";
import { getKcClsx } from "keycloakify/login/lib/kcClsx";
import { clsx } from "keycloakify/tools/clsx";
import { useSetClassName } from "keycloakify/tools/useSetClassName";
import React, { useEffect, useLayoutEffect } from "react";
import type { KcContext } from "./KcContext";
import type { I18n } from "./i18n";
import { useBreakpoint } from "./useBreakpoint";

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

    // Set favicon
    useLayoutEffect(() => {
        const faviconTag = document.querySelector('link[rel="icon"]') as HTMLLinkElement | undefined;
        if (faviconTag) {
            faviconTag.type = "image/svg+xml";
            faviconTag.href = encodedFavIconHref;
        } else {
            const newFaviconTag = document.createElement("link");
            newFaviconTag.setAttribute("rel", "icon");
            newFaviconTag.type = "image/svg+xml";
            newFaviconTag.href = encodedFavIconHref;
            document.getElementsByTagName("head")[0].appendChild(newFaviconTag);
        }
    }, []);

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

    const breakpoint = useBreakpoint();
    const isMobile = breakpoint === "BASE";

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
        <Card className={clsx({ "kh-template-card": true, "full-width": isMobile })} padding="md" radius="md" withBorder={!isMobile}>
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

const encodedFavIconHref =
    "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJpY29uIGljb24tdGFibGVyIGljb25zLXRhYmxlci1vdXRsaW5lIGljb24tdGFibGVyLWNvZmZlZSB0aGVtZS1kZXBlbmRlbnQtc3Ryb2tlIj4KICA8cGF0aCBzdHJva2U9Im5vbmUiIGQ9Ik0wIDBoMjR2MjRIMHoiIGZpbGw9Im5vbmUiLz4KICA8cGF0aCBkPSJNMyAxNGMuODMgLjY0MiAyLjA3NyAxLjAxNyAzLjUgMWMxLjQyMy4wMTcgMi42Ny0uMzU4IDMuNS0xIC44My0uNjQyIDIuMDc3LTEuMDE3IDMuNS0xIDEuNDIzLjAxNyAyLjY3LjM1OCAzLjUgMSIvPgogIDxwYXRoIGQ9Ik04IDNhMi40IDIuNCAwIDAgMC0xIDJhMi40IDIuNCAwIDAgMCAxIDIiLz4KICA8cGF0aCBkPSJNMTIgM2EyLjQgMi40IDAgMCAwLTEgMmEyLjQgMi40IDAgMCAwIDEgMiIvPgogIDxwYXRoIGQ9Ik0zIDEwaDE0djVhNiA2IDAgMCAxLTYgNkg5YTYgNiAwIDAgMS02LTZ2LTV6Ii8+CiAgPHBhdGggZD0iTTE2Ljc0NiAxNi43MjZhMyAzIDAgMSAwIC4yNTIgLTUuNTU1Ii8+CiAgPHN0eWxlPgogICAgLnRoZW1lLWRlcGVuZGVudC1zdHJva2UgewogICAgICAgIHN0cm9rZTogYmxhY2s7CiAgICAgIH0KCiAgICAgIEBtZWRpYSAocHJlZmVycy1jb2xvci1zY2hlbWU6IGRhcmsgKSB7CiAgICAgICAgLnRoZW1lLWRlcGVuZGVudC1zdHJva2UgewogICAgICAgIHN0cm9rZTogd2hpdGU7CiAgICAgICAgfQogICAgICB9CiAgPC9zdHlsZT4KPC9zdmc+Cg==";
