import assert from "node:assert/strict";
import { entriesOf, parseConfig, sectionEntries } from "../../src/core/parser";

function testOpenVpnEvidence() {
  const parsed = parseConfig([
    "client",
    "dev tun",
    "cipher BF-CBC # weak legacy cipher",
    "auth SHA1"
  ].join("\n"));

  assert.equal(parsed.type, "openvpn");
  assert.deepEqual(entriesOf(parsed, "cipher"), [
    {
      key: "cipher",
      value: "BF-CBC",
      line: 3,
      raw: "cipher BF-CBC # weak legacy cipher"
    }
  ]);
}

function testWireGuardEvidence() {
  const parsed = parseConfig([
    "[Interface]",
    "PrivateKey = AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=",
    "",
    "[Peer]",
    "AllowedIPs = 0.0.0.0/0"
  ].join("\n"));

  assert.equal(parsed.type, "wireguard");
  assert.deepEqual(sectionEntries(parsed, "peer", "allowedips"), [
    {
      key: "allowedips",
      value: "0.0.0.0/0",
      line: 5,
      raw: "AllowedIPs = 0.0.0.0/0",
      section: "peer"
    }
  ]);
}

export function runParserTests() {
  testOpenVpnEvidence();
  testWireGuardEvidence();
}
