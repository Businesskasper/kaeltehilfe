import { MantineProvider, colorsTuple } from "@mantine/core";
import { DatesProvider } from "@mantine/dates";
import { Notifications } from "@mantine/notifications";
import type { ClassKey } from "keycloakify/login";
import DefaultPage from "keycloakify/login/DefaultPage";
import DefaultTemplate from "keycloakify/login/Template";
import { Suspense, lazy } from "react";
import type { KcContext } from "./KcContext";
import Template from "./Template";
import { useI18n } from "./i18n";

const UserProfileFormFields = lazy(
    () => import("keycloakify/login/UserProfileFormFields")
);

const Login = lazy(() => import("./pages/Login"));

const doMakeUserConfirmPassword = true;

export default function KcPage(props: { kcContext: KcContext }) {
    return (
        <MantineProvider
            defaultColorScheme="light"
            theme={{
                // scale: 1.2,
                colors: {
                    red: colorsTuple("#e60005"),
                    soft_red: colorsTuple("#e46450"),
                    dark_red: colorsTuple("#a51e0f"),
                    light_blue: colorsTuple("#EBF5FF"),
                    blue: colorsTuple("#2275D0"),
                    middle_blue: colorsTuple("#008CCD"),
                    dark_blue: colorsTuple("#002D55"),
                    light_gray: colorsTuple("#EFEEEA"),
                    middle_gray: colorsTuple("#B4B4B4"),
                    dark_gray: colorsTuple("#554F4A"),
                    country_gray: colorsTuple("#D9D9D9")
                },
                primaryColor: "blue"
            }}
        >
            <DatesProvider settings={{ locale: "de" }}>
                <Notifications position="bottom-center" />
                <KcPageContextualized {...props} />
            </DatesProvider>
        </MantineProvider>
    );
}

function KcPageContextualized(props: { kcContext: KcContext }) {
    const { kcContext } = props;

    const { i18n } = useI18n({ kcContext });

    return (
        <Suspense>
            {(() => {
                switch (kcContext.pageId) {
                    case "login.ftl":
                        return (
                            <Login
                                {...{ kcContext, i18n, classes: loginClasses }}
                                Template={Template}
                                doUseDefaultCss={true}
                            />
                        );
                    default:
                        return (
                            <DefaultPage
                                kcContext={kcContext}
                                i18n={i18n}
                                classes={defaultClasses}
                                Template={DefaultTemplate}
                                doUseDefaultCss={true}
                                UserProfileFormFields={UserProfileFormFields}
                                doMakeUserConfirmPassword={doMakeUserConfirmPassword}
                            />
                        );
                }
            })()}
        </Suspense>
    );
}

const loginClasses = {
    kcHtmlClass: "",
    kcBodyClass: "login-body",
    kcInfoAreaWrapperClass: "login-info-wrapper",
    kcInfoAreaClass: "",
    kcSignUpClass: "signup"
    // kcLoginClass: "login-modal-wrapper"
} satisfies {
    [key in ClassKey]?: string;
};

const defaultClasses = {
    kcHtmlClass: "",
    kcBodyClass: ""
} satisfies {
    [key in ClassKey]?: string;
};
