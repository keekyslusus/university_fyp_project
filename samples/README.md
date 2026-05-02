VPN GATE - https://www.vpngate.net/en/

## Evaluation samples

The `secure` and `insecure` folders contain small, curated configurations for static-analysis evaluation.

- `secure/openvpn-secure.ovpn` - expected to produce no critical OpenVPN findings.
- `secure/wireguard-secure.conf` - expected to produce only the normal sensitive-file warning for `PrivateKey`.
- `insecure/openvpn-dangerous-scripts.ovpn` - checks script execution rules.
- `insecure/openvpn-legacy-tls-inline-key.ovpn` - checks weak crypto, legacy TLS, compression, and inline key exposure.
- `insecure/wireguard-dns-leak.conf` - checks full-tunnel DNS leak risk.
- `insecure/wireguard-malformed.conf` - checks malformed key and endpoint validation.

Expected results are listed in `evaluation.csv`.
