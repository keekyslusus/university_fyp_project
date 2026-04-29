import { hasDirective, sectionValues, valuesOf } from "./parser";
import type { Finding, ParsedConfig, Severity } from "./types";

function finding(
  id: string,
  severity: Severity,
  title: string,
  description: string,
  recommendation: string
): Finding {
  return { id, severity, title, description, recommendation };
}

const weakCiphers = ["bf-cbc", "des-cbc", "3des", "des-ede3-cbc", "rc2", "rc4", "none"];
const weakAuth = ["sha1", "md5", "none"];

export function analyzeOpenVpn(config: ParsedConfig): Finding[] {
  const findings: Finding[] = [];
  const ciphers = valuesOf(config, "cipher").map((value) => value.toLowerCase());
  const dataCiphers = valuesOf(config, "data-ciphers").join(":").toLowerCase();
  const authValues = valuesOf(config, "auth").map((value) => value.toLowerCase());

  if (ciphers.some((cipher) => weakCiphers.some((weak) => cipher.includes(weak)))) {
    findings.push(finding(
      "openvpn-weak-cipher",
      "high",
      "Обнаружен слабый алгоритм шифрования",
      "В конфигурации OpenVPN указан устаревший или небезопасный cipher. Такие алгоритмы снижают стойкость защищённого канала.",
      "Используйте современные AEAD-алгоритмы, например AES-256-GCM или CHACHA20-POLY1305, и задайте их через data-ciphers."
    ));
  }

  if (ciphers.length === 0 && !dataCiphers) {
    findings.push(finding(
      "openvpn-no-cipher-policy",
      "medium",
      "Не задана явная политика шифрования",
      "В файле не найдено директив cipher или data-ciphers. Без явной политики сложнее контролировать фактические параметры защиты.",
      "Укажите data-ciphers с современными алгоритмами и проверьте совместимость клиента и сервера."
    ));
  }

  if (authValues.some((auth) => weakAuth.some((weak) => auth.includes(weak)))) {
    findings.push(finding(
      "openvpn-weak-auth",
      "high",
      "Используется слабый алгоритм контроля целостности",
      "Значение auth указывает на SHA1, MD5 или отключение проверки. Это повышает риск атак на целостность передаваемых данных.",
      "Используйте SHA256/SHA384 или AEAD-режимы, где контроль целостности встроен в алгоритм шифрования."
    ));
  }

  if (!hasDirective(config, "remote-cert-tls")) {
    findings.push(finding(
      "openvpn-no-remote-cert-tls",
      "high",
      "Не найдена проверка назначения сертификата сервера",
      "Без remote-cert-tls server клиент может недостаточно строго проверять сертификат удалённой стороны.",
      "Добавьте директиву remote-cert-tls server и проверьте корректность цепочки сертификатов."
    ));
  }

  if (!hasDirective(config, "tls-auth") && !hasDirective(config, "tls-crypt")) {
    findings.push(finding(
      "openvpn-no-tls-hardening",
      "medium",
      "Не найдено дополнительное усиление TLS-канала",
      "Отсутствие tls-auth или tls-crypt может упростить сканирование VPN-сервера и некоторые DoS-сценарии.",
      "Для новых конфигураций предпочтительно использовать tls-crypt, если это поддерживается сервером."
    ));
  }

  if (hasDirective(config, "comp-lzo") || hasDirective(config, "compress")) {
    findings.push(finding(
      "openvpn-compression-enabled",
      "high",
      "Включено сжатие трафика",
      "Сжатие в VPN-соединениях может создавать риск утечек по побочным каналам и обычно не рекомендуется для защищённых туннелей.",
      "Отключите comp-lzo/compress, если нет строгой производственной необходимости."
    ));
  }

  if (valuesOf(config, "proto").some((value) => value.toLowerCase().includes("tcp"))) {
    findings.push(finding(
      "openvpn-tcp-proto",
      "low",
      "Используется TCP-режим OpenVPN",
      "TCP не является прямой уязвимостью, но может ухудшать устойчивость и производительность туннеля из-за TCP-over-TCP.",
      "Для большинства сценариев рассмотрите UDP, если это допускается политикой сети."
    ));
  }

  if (!hasDirective(config, "auth-nocache")) {
    findings.push(finding(
      "openvpn-no-auth-nocache",
      "medium",
      "Учётные данные могут кэшироваться клиентом",
      "В конфигурации не найдена директива auth-nocache. Это может повысить риск раскрытия пароля на клиентском устройстве.",
      "Добавьте auth-nocache для уменьшения времени хранения учётных данных в памяти клиента."
    ));
  }

  if (findings.length === 0) {
    findings.push(finding(
      "openvpn-no-critical-issues",
      "info",
      "Критичных проблем OpenVPN не обнаружено",
      "Базовые параметры конфигурации не содержат известных небезопасных настроек из набора правил.",
      "Дополнительно проверьте серверную конфигурацию, политику обновлений, MFA и журналы подключений."
    ));
  }

  return findings;
}

export function analyzeWireGuard(config: ParsedConfig): Finding[] {
  const findings: Finding[] = [];
  const interfaceAddresses = sectionValues(config, "interface", "address");
  const dnsValues = sectionValues(config, "interface", "dns");
  const privateKeys = sectionValues(config, "interface", "privatekey");
  const peerPublicKeys = sectionValues(config, "peer", "publickey");
  const endpoints = sectionValues(config, "peer", "endpoint");
  const allowedIps = sectionValues(config, "peer", "allowedips");
  const persistentKeepalive = sectionValues(config, "peer", "persistentkeepalive");

  if (privateKeys.length > 0) {
    findings.push(finding(
      "wireguard-private-key-present",
      "medium",
      "В конфигурации присутствует приватный ключ",
      "Для WireGuard это нормально, но файл с PrivateKey является чувствительным и требует защиты на уровне файловой системы.",
      "Храните конфигурацию в защищённом каталоге, ограничьте права доступа и не передавайте файл по открытым каналам."
    ));
  }

  if (peerPublicKeys.length === 0) {
    findings.push(finding(
      "wireguard-no-peer-key",
      "high",
      "Не найден публичный ключ peer",
      "Без PublicKey невозможно надёжно идентифицировать удалённую сторону туннеля.",
      "Проверьте наличие секции [Peer] и параметра PublicKey."
    ));
  }

  if (endpoints.length === 0) {
    findings.push(finding(
      "wireguard-no-endpoint",
      "medium",
      "Не указан Endpoint",
      "Отсутствие Endpoint может быть допустимо для серверной стороны, но для клиентской конфигурации это часто означает неполную настройку.",
      "Для клиентского профиля укажите Endpoint сервера в формате host:port."
    ));
  }

  if (allowedIps.length === 0) {
    findings.push(finding(
      "wireguard-no-allowed-ips",
      "high",
      "Не задан AllowedIPs",
      "Параметр AllowedIPs определяет маршрутизацию через туннель. Его отсутствие делает поведение соединения неопределённым.",
      "Задайте AllowedIPs согласно политике: только корпоративные подсети или полный туннель при необходимости."
    ));
  }

  if (allowedIps.some((value) => value.includes("0.0.0.0/0") || value.includes("::/0"))) {
    findings.push(finding(
      "wireguard-full-tunnel",
      "low",
      "Включён полный туннель",
      "AllowedIPs = 0.0.0.0/0 или ::/0 направляет весь трафик через VPN. Это не ошибка, но требует корректной DNS и kill switch политики.",
      "Проверьте DNS, маршрутизацию и правила блокировки трафика при разрыве VPN-соединения."
    ));
  }

  if (dnsValues.length === 0) {
    findings.push(finding(
      "wireguard-no-dns",
      "medium",
      "Не задан DNS для туннеля",
      "Без явного DNS часть запросов может уходить через системные резолверы, что повышает риск DNS leak.",
      "Укажите доверенный DNS-сервер в секции [Interface] и проверьте отсутствие DNS-утечек."
    ));
  }

  if (persistentKeepalive.length === 0) {
    findings.push(finding(
      "wireguard-no-keepalive",
      "low",
      "Не задан PersistentKeepalive",
      "Для клиентов за NAT отсутствие PersistentKeepalive может приводить к нестабильности соединения.",
      "Если клиент находится за NAT, укажите PersistentKeepalive = 25."
    ));
  }

  if (interfaceAddresses.length === 0) {
    findings.push(finding(
      "wireguard-no-address",
      "high",
      "Не задан адрес интерфейса",
      "Без Address интерфейс WireGuard может быть настроен неполно и не получит ожидаемую адресацию в туннеле.",
      "Добавьте Address в секцию [Interface] согласно схеме адресации VPN."
    ));
  }

  if (findings.length === 0) {
    findings.push(finding(
      "wireguard-no-critical-issues",
      "info",
      "Критичных проблем WireGuard не обнаружено",
      "Базовые параметры конфигурации не содержат известных небезопасных настроек из набора правил.",
      "Дополнительно проверьте права доступа к файлу, серверную политику и мониторинг подключений."
    ));
  }

  return findings;
}

export function analyzeUnknown(): Finding[] {
  return [
    finding(
      "unknown-format",
      "high",
      "Тип VPN-конфигурации не распознан",
      "Программа не смогла определить формат файла как OpenVPN или WireGuard.",
      "Загрузите файл .ovpn для OpenVPN или .conf с секциями [Interface]/[Peer] для WireGuard."
    )
  ];
}
