"use client";
import { useLanguage } from "./language-provider";
import { ArrowUpRight, HeartHandshake, Mail, MapPin, Phone } from "lucide-react";

export default function ContactDetails() {
 const { t } = useLanguage();

  return <div className="contact-directory">
    <div className="contact-directory-cards">
      <section className="contact-panel" aria-labelledby="foundation-contact-heading">
        <div className="contact-panel-heading"><span className="contact-panel-icon"><HeartHandshake size={25} strokeWidth={1.5}/></span><div><span className="eyebrow">{t("LET’S MAKE A DIFFERENCE")}</span><h3 id="foundation-contact-heading">{t("Foundation enquiries")}</h3></div></div>
        <p className="contact-panel-description">{t("For programme support, contribution arrangements, partnerships, and general enquiries.")}</p>
        <a className="contact-detail-link" href="mailto:alshehzafoundation@gmail.com"><Mail size={21}/><span><small>{t("FOUNDATION EMAIL")}</small><bdi dir="ltr">alshehzafoundation@gmail.com</bdi></span><ArrowUpRight size={19}/></a>
      </section>
      <section className="contact-panel" aria-labelledby="founder-contact-heading">
        <div className="contact-panel-heading"><span className="contact-panel-initials" translate="no">SR</span><div><span className="eyebrow">{t("FOUNDER & PRESIDENT")}</span><h3 id="founder-contact-heading">S. Rismir</h3></div></div>
        <p className="contact-panel-description">{t("Get in touch with the foundation’s Founder and President directly.")}</p>
        <a className="contact-detail-link" href="tel:+94771415023"><Phone size={21}/><span><small>{t("DIRECT PHONE")}</small><bdi dir="ltr">+94 77 141 5023</bdi></span><ArrowUpRight size={19}/></a>
        <a className="contact-detail-link" href="mailto:sawahirrismir3@gmail.com"><Mail size={21}/><span><small>{t("DIRECT EMAIL")}</small><bdi dir="ltr">sawahirrismir3@gmail.com</bdi></span><ArrowUpRight size={19}/></a>
      </section>
    </div>
    <section className="contact-address-panel" aria-labelledby="contact-address-heading">
      <div className="contact-address-heading"><span className="contact-panel-icon"><MapPin size={26} strokeWidth={1.5}/></span><div><span className="eyebrow">{t("AL SHEHZA FOUNDATION")}</span><h3 id="contact-address-heading">{t("Our address")}</h3></div></div>
      <address>{t("Idiman, Kinniya,")}<br/><span>{t("Trincomalee, Sri Lanka")}</span></address>
    </section>
  </div>;
}
