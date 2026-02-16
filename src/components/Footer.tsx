import { t } from "../i18n";

export default function Footer() {
    const strings = t();

    return (
        <p className="text-center text-text-muted text-sm">
            {strings.common.poweredBy}{" "}
            <a
                href="https://boltz.exchange"
                target="_blank"
                rel="noopener noreferrer"
                className="text-boltz-link hover:text-boltz-link-hover transition-colors">
                {strings.common.boltz}
            </a>
        </p>
    );
}
