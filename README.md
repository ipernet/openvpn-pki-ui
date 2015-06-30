Intro
---------------

Used with [**Mini-SSO Google**][1], this UI allows to generate credentials for your OpenVPN instance.

You can change the **authentication middleware** if you are not using **Google Apps for Work**.

Installation
---------------

- Fill ``config.yml`` as follow:
  - ``listen``: **Port** and **address** for Express to bind to. Ensure to run  the app as a backend service with a **SSL-only** front end server.
  - ``sso``: **SSO API endpoint** and **cookie name**, see [**Mini-SSO Google**][1].
  - ``ca``: Path to your **Certificate Authority certificate** and **key**  files used by your [**OpenVPN instance**][2].
  - ``ovpn``: The ``.ovpn`` client configuration that that will be sent along with the generated credentials. Ensure to **keep tokens** for CA/Cert/Key

[1]: https://github.com/ipernet/mini-sso-google

[2]: https://openvpn.net/index.php/open-source/documentation/howto.html#pki
