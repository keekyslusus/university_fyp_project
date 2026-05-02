import type { Language } from "./dictionaries";

type FindingCopy = {
  title: string;
  description: string;
  recommendation: string;
};

export type FindingId =
  | "openvpn-weak-cipher"
  | "openvpn-no-cipher-policy"
  | "openvpn-weak-auth"
  | "openvpn-no-remote-cert-tls"
  | "openvpn-no-tls-hardening"
  | "openvpn-compression-enabled"
  | "openvpn-tcp-proto"
  | "openvpn-no-auth-nocache"
  | "openvpn-no-tls-version-min"
  | "openvpn-weak-tls-version-min"
  | "openvpn-no-verify-x509-name"
  | "openvpn-dangerous-script-security"
  | "openvpn-script-hook"
  | "openvpn-inline-private-key"
  | "openvpn-no-critical-issues"
  | "wireguard-private-key-present"
  | "wireguard-no-interface-section"
  | "wireguard-no-peer-section"
  | "wireguard-no-peer-key"
  | "wireguard-no-endpoint"
  | "wireguard-no-allowed-ips"
  | "wireguard-full-tunnel"
  | "wireguard-no-dns"
  | "wireguard-no-keepalive"
  | "wireguard-no-address"
  | "wireguard-malformed-key"
  | "wireguard-malformed-endpoint"
  | "wireguard-full-tunnel-no-dns"
  | "wireguard-no-critical-issues"
  | "unknown-format";

const findingDictionaries = {
  ru: {
    "openvpn-weak-cipher": {
      title: "Обнаружен слабый алгоритм шифрования",
      description: "В конфигурации OpenVPN указан устаревший или небезопасный cipher. Такие алгоритмы снижают стойкость защищенного канала.",
      recommendation: "Используйте современные AEAD-алгоритмы, например AES-256-GCM или CHACHA20-POLY1305, и задайте их через data-ciphers."
    },
    "openvpn-no-cipher-policy": {
      title: "Не задана явная политика шифрования",
      description: "В файле не найдено директив cipher или data-ciphers. Без явной политики сложнее контролировать фактические параметры защиты.",
      recommendation: "Укажите data-ciphers с современными алгоритмами и проверьте совместимость клиента и сервера."
    },
    "openvpn-weak-auth": {
      title: "Используется слабый алгоритм контроля целостности",
      description: "Значение auth указывает на SHA1, MD5 или отключение проверки. Это повышает риск атак на целостность передаваемых данных.",
      recommendation: "Используйте SHA256/SHA384 или AEAD-режимы, где контроль целостности встроен в алгоритм шифрования."
    },
    "openvpn-no-remote-cert-tls": {
      title: "Не найдена проверка назначения сертификата сервера",
      description: "Без remote-cert-tls server клиент может недостаточно строго проверять сертификат удаленной стороны.",
      recommendation: "Добавьте директиву remote-cert-tls server и проверьте корректность цепочки сертификатов."
    },
    "openvpn-no-tls-hardening": {
      title: "Не найдено дополнительное усиление TLS-канала",
      description: "Отсутствие tls-auth или tls-crypt может упростить сканирование VPN-сервера и некоторые DoS-сценарии.",
      recommendation: "Для новых конфигураций предпочтительно использовать tls-crypt, если это поддерживается сервером."
    },
    "openvpn-compression-enabled": {
      title: "Включено сжатие трафика",
      description: "Сжатие в VPN-соединениях может создавать риск утечек по побочным каналам и обычно не рекомендуется для защищенных туннелей.",
      recommendation: "Отключите comp-lzo/compress, если нет строгой производственной необходимости."
    },
    "openvpn-tcp-proto": {
      title: "Используется TCP-режим OpenVPN",
      description: "TCP не является прямой уязвимостью, но может ухудшать устойчивость и производительность туннеля из-за TCP-over-TCP.",
      recommendation: "Для большинства сценариев рассмотрите UDP, если это допускается политикой сети."
    },
    "openvpn-no-auth-nocache": {
      title: "Учетные данные могут кэшироваться клиентом",
      description: "В конфигурации не найдена директива auth-nocache. Это может повысить риск раскрытия пароля на клиентском устройстве.",
      recommendation: "Добавьте auth-nocache для уменьшения времени хранения учетных данных в памяти клиента."
    },
    "openvpn-no-tls-version-min": {
      title: "Не задана минимальная версия TLS",
      description: "В конфигурации не найдена директива tls-version-min. Без явного ограничения клиент может зависеть от настроек по умолчанию и совместимости со старыми протоколами.",
      recommendation: "Добавьте tls-version-min 1.2 или выше, если это поддерживается сервером и клиентом."
    },
    "openvpn-weak-tls-version-min": {
      title: "Разрешена устаревшая версия TLS",
      description: "Директива tls-version-min разрешает TLS ниже 1.2, что снижает криптографическую стойкость TLS-канала.",
      recommendation: "Установите tls-version-min 1.2 или 1.3 и проверьте совместимость всех клиентов."
    },
    "openvpn-no-verify-x509-name": {
      title: "Не найдена проверка имени сертификата сервера",
      description: "Без verify-x509-name клиент проверяет цепочку сертификатов, но может не ограничивать ожидаемое имя сервера достаточно явно.",
      recommendation: "Добавьте verify-x509-name с ожидаемым именем сервера и подходящим режимом проверки."
    },
    "openvpn-dangerous-script-security": {
      title: "Разрешено выполнение внешних скриптов",
      description: "script-security 2 или 3 позволяет OpenVPN запускать внешние команды и скрипты, что увеличивает риск локального выполнения кода.",
      recommendation: "Используйте минимально необходимый уровень script-security и удалите его, если скрипты не нужны."
    },
    "openvpn-script-hook": {
      title: "Обнаружен hook для запуска скрипта",
      description: "Директивы up, down, route-up или learn-address могут запускать локальные скрипты во время жизненного цикла VPN-соединения.",
      recommendation: "Проверьте путь к скрипту, права доступа и необходимость hook. Удалите директиву, если она не требуется."
    },
    "openvpn-inline-private-key": {
      title: "В конфигурации найден inline private key",
      description: "Встроенный приватный ключ делает файл конфигурации чувствительным артефактом и повышает риск раскрытия ключевого материала.",
      recommendation: "Храните файл в защищенном каталоге, ограничьте права доступа и не передавайте его по открытым каналам."
    },
    "openvpn-no-critical-issues": {
      title: "Критичных проблем OpenVPN не обнаружено",
      description: "Базовые параметры конфигурации не содержат известных небезопасных настроек из набора правил.",
      recommendation: "Дополнительно проверьте серверную конфигурацию, политику обновлений, MFA и журналы подключений."
    },
    "wireguard-private-key-present": {
      title: "В конфигурации присутствует приватный ключ",
      description: "Для WireGuard это нормально, но файл с PrivateKey является чувствительным и требует защиты на уровне файловой системы.",
      recommendation: "Храните конфигурацию в защищенном каталоге, ограничьте права доступа и не передавайте файл по открытым каналам."
    },
    "wireguard-no-interface-section": {
      title: "Не найдена секция [Interface]",
      description: "WireGuard-конфигурация без секции [Interface] не содержит локальных параметров туннеля и выглядит неполной.",
      recommendation: "Добавьте секцию [Interface] с Address, PrivateKey и другими параметрами клиента."
    },
    "wireguard-no-peer-section": {
      title: "Не найдена секция [Peer]",
      description: "WireGuard-конфигурация без секции [Peer] не описывает удаленную сторону туннеля.",
      recommendation: "Добавьте секцию [Peer] с PublicKey, AllowedIPs и Endpoint для клиентского профиля."
    },
    "wireguard-no-peer-key": {
      title: "Не найден публичный ключ peer",
      description: "Без PublicKey невозможно надежно идентифицировать удаленную сторону туннеля.",
      recommendation: "Проверьте наличие секции [Peer] и параметра PublicKey."
    },
    "wireguard-no-endpoint": {
      title: "Не указан Endpoint",
      description: "Отсутствие Endpoint может быть допустимо для серверной стороны, но для клиентской конфигурации это часто означает неполную настройку.",
      recommendation: "Для клиентского профиля укажите Endpoint сервера в формате host:port."
    },
    "wireguard-no-allowed-ips": {
      title: "Не задан AllowedIPs",
      description: "Параметр AllowedIPs определяет маршрутизацию через туннель. Его отсутствие делает поведение соединения неопределенным.",
      recommendation: "Задайте AllowedIPs согласно политике: только корпоративные подсети или полный туннель при необходимости."
    },
    "wireguard-full-tunnel": {
      title: "Включен полный туннель",
      description: "AllowedIPs = 0.0.0.0/0 или ::/0 направляет весь трафик через VPN. Это не ошибка, но требует корректной DNS и kill switch политики.",
      recommendation: "Проверьте DNS, маршрутизацию и правила блокировки трафика при разрыве VPN-соединения."
    },
    "wireguard-no-dns": {
      title: "Не задан DNS для туннеля",
      description: "Без явного DNS часть запросов может уходить через системные резолверы, что повышает риск DNS leak.",
      recommendation: "Укажите доверенный DNS-сервер в секции [Interface] и проверьте отсутствие DNS-утечек."
    },
    "wireguard-no-keepalive": {
      title: "Не задан PersistentKeepalive",
      description: "Для клиентов за NAT отсутствие PersistentKeepalive может приводить к нестабильности соединения.",
      recommendation: "Если клиент находится за NAT, укажите PersistentKeepalive = 25."
    },
    "wireguard-no-address": {
      title: "Не задан адрес интерфейса",
      description: "Без Address интерфейс WireGuard может быть настроен неполно и не получит ожидаемую адресацию в туннеле.",
      recommendation: "Добавьте Address в секцию [Interface] согласно схеме адресации VPN."
    },
    "wireguard-malformed-key": {
      title: "Ключ WireGuard имеет некорректный формат",
      description: "Значение PrivateKey или PublicKey не похоже на стандартный base64-ключ WireGuard длиной 44 символа.",
      recommendation: "Проверьте, что ключ скопирован полностью и не содержит пробелов, переносов или лишних символов."
    },
    "wireguard-malformed-endpoint": {
      title: "Endpoint имеет некорректный формат",
      description: "Endpoint должен указывать адрес сервера и порт. Некорректный формат может привести к неработающему или неоднозначному подключению.",
      recommendation: "Используйте формат host:port, например vpn.example.org:51820, или [IPv6]:port для IPv6-адреса."
    },
    "wireguard-full-tunnel-no-dns": {
      title: "Полный туннель настроен без DNS",
      description: "AllowedIPs направляет весь трафик через VPN, но DNS в секции [Interface] не задан. Это повышает риск DNS-утечек.",
      recommendation: "Добавьте доверенный DNS в секцию [Interface] и проверьте поведение DNS при подключении и отключении VPN."
    },
    "wireguard-no-critical-issues": {
      title: "Критичных проблем WireGuard не обнаружено",
      description: "Базовые параметры конфигурации не содержат известных небезопасных настроек из набора правил.",
      recommendation: "Дополнительно проверьте права доступа к файлу, серверную политику и мониторинг подключений."
    },
    "unknown-format": {
      title: "Тип VPN-конфигурации не распознан",
      description: "Программа не смогла определить формат файла как OpenVPN или WireGuard.",
      recommendation: "Загрузите файл .ovpn для OpenVPN или .conf с секциями [Interface]/[Peer] для WireGuard."
    }
  },
  en: {
    "openvpn-weak-cipher": {
      title: "Weak encryption algorithm detected",
      description: "The OpenVPN configuration uses an outdated or unsafe cipher. Such algorithms reduce the strength of the protected channel.",
      recommendation: "Use modern AEAD algorithms such as AES-256-GCM or CHACHA20-POLY1305 and define them through data-ciphers."
    },
    "openvpn-no-cipher-policy": {
      title: "Explicit encryption policy is missing",
      description: "The file does not contain cipher or data-ciphers directives. Without an explicit policy, the effective protection settings are harder to control.",
      recommendation: "Set data-ciphers with modern algorithms and verify client and server compatibility."
    },
    "openvpn-weak-auth": {
      title: "Weak integrity algorithm is used",
      description: "The auth value points to SHA1, MD5, or disabled integrity checks. This increases the risk of attacks against transferred data integrity.",
      recommendation: "Use SHA256/SHA384 or AEAD modes where integrity protection is built into the encryption algorithm."
    },
    "openvpn-no-remote-cert-tls": {
      title: "Server certificate purpose check is missing",
      description: "Without remote-cert-tls server, the client may not strictly verify the certificate purpose of the remote side.",
      recommendation: "Add the remote-cert-tls server directive and verify that the certificate chain is correct."
    },
    "openvpn-no-tls-hardening": {
      title: "Additional TLS channel hardening is missing",
      description: "The absence of tls-auth or tls-crypt can make VPN server scanning and some DoS scenarios easier.",
      recommendation: "For new configurations, prefer tls-crypt if it is supported by the server."
    },
    "openvpn-compression-enabled": {
      title: "Traffic compression is enabled",
      description: "Compression in VPN connections can create side-channel leak risks and is usually not recommended for protected tunnels.",
      recommendation: "Disable comp-lzo/compress unless there is a strict production requirement."
    },
    "openvpn-tcp-proto": {
      title: "OpenVPN TCP mode is used",
      description: "TCP is not a direct vulnerability, but it can reduce tunnel stability and performance because of TCP-over-TCP behavior.",
      recommendation: "For most scenarios, consider UDP if the network policy allows it."
    },
    "openvpn-no-auth-nocache": {
      title: "Client credentials may be cached",
      description: "The configuration does not include auth-nocache. This can increase the risk of password exposure on the client device.",
      recommendation: "Add auth-nocache to reduce how long credentials remain in the client memory."
    },
    "openvpn-no-tls-version-min": {
      title: "Minimum TLS version is not set",
      description: "The configuration does not include tls-version-min. Without an explicit lower bound, the client depends on defaults and compatibility with older protocols.",
      recommendation: "Add tls-version-min 1.2 or higher if supported by the server and clients."
    },
    "openvpn-weak-tls-version-min": {
      title: "Outdated TLS version is allowed",
      description: "The tls-version-min directive allows TLS below 1.2, which weakens the cryptographic posture of the TLS channel.",
      recommendation: "Set tls-version-min to 1.2 or 1.3 and verify compatibility across clients."
    },
    "openvpn-no-verify-x509-name": {
      title: "Server certificate name check is missing",
      description: "Without verify-x509-name, the client may validate the certificate chain but not strictly pin the expected server identity.",
      recommendation: "Add verify-x509-name with the expected server name and an appropriate verification mode."
    },
    "openvpn-dangerous-script-security": {
      title: "External script execution is enabled",
      description: "script-security 2 or 3 allows OpenVPN to run external commands and scripts, increasing local code execution risk.",
      recommendation: "Use the minimum required script-security level and remove it if scripts are not needed."
    },
    "openvpn-script-hook": {
      title: "Script execution hook detected",
      description: "Directives such as up, down, route-up, or learn-address can run local scripts during the VPN connection lifecycle.",
      recommendation: "Review the script path, file permissions, and business need. Remove the hook if it is not required."
    },
    "openvpn-inline-private-key": {
      title: "Inline private key found in configuration",
      description: "An embedded private key makes the configuration file a sensitive artifact and increases key exposure risk.",
      recommendation: "Store the file in a protected location, restrict access permissions, and do not send it through open channels."
    },
    "openvpn-no-critical-issues": {
      title: "No critical OpenVPN issues detected",
      description: "The basic configuration parameters do not contain known unsafe settings from the current rule set.",
      recommendation: "Also review the server configuration, update policy, MFA, and connection logs."
    },
    "wireguard-private-key-present": {
      title: "The configuration contains a private key",
      description: "This is normal for WireGuard, but a file with PrivateKey is sensitive and must be protected at the file-system level.",
      recommendation: "Store the configuration in a protected directory, restrict access rights, and do not send the file through open channels."
    },
    "wireguard-no-interface-section": {
      title: "[Interface] section is missing",
      description: "A WireGuard configuration without [Interface] does not define local tunnel parameters and appears incomplete.",
      recommendation: "Add an [Interface] section with Address, PrivateKey, and other client parameters."
    },
    "wireguard-no-peer-section": {
      title: "[Peer] section is missing",
      description: "A WireGuard configuration without [Peer] does not describe the remote side of the tunnel.",
      recommendation: "Add a [Peer] section with PublicKey, AllowedIPs, and Endpoint for a client profile."
    },
    "wireguard-no-peer-key": {
      title: "Peer public key is missing",
      description: "Without PublicKey, the tunnel cannot reliably identify the remote peer.",
      recommendation: "Check that the [Peer] section and the PublicKey parameter are present."
    },
    "wireguard-no-endpoint": {
      title: "Endpoint is missing",
      description: "A missing Endpoint may be valid for a server-side profile, but for a client configuration it often means the setup is incomplete.",
      recommendation: "For a client profile, set the server Endpoint in host:port format."
    },
    "wireguard-no-allowed-ips": {
      title: "AllowedIPs is missing",
      description: "AllowedIPs controls routing through the tunnel. If it is missing, connection behavior becomes undefined.",
      recommendation: "Set AllowedIPs according to policy: corporate subnets only, or a full tunnel when required."
    },
    "wireguard-full-tunnel": {
      title: "Full tunnel mode is enabled",
      description: "AllowedIPs = 0.0.0.0/0 or ::/0 sends all traffic through the VPN. This is not an error, but it requires correct DNS and kill switch policy.",
      recommendation: "Check DNS, routing, and traffic blocking rules for VPN disconnect scenarios."
    },
    "wireguard-no-dns": {
      title: "Tunnel DNS is missing",
      description: "Without explicit DNS, some requests may use system resolvers, which increases the risk of DNS leaks.",
      recommendation: "Set a trusted DNS server in the [Interface] section and verify that DNS leaks do not occur."
    },
    "wireguard-no-keepalive": {
      title: "PersistentKeepalive is missing",
      description: "For clients behind NAT, missing PersistentKeepalive may cause connection instability.",
      recommendation: "If the client is behind NAT, set PersistentKeepalive = 25."
    },
    "wireguard-no-address": {
      title: "Interface address is missing",
      description: "Without Address, the WireGuard interface may be incomplete and may not receive the expected tunnel addressing.",
      recommendation: "Add Address to the [Interface] section according to the VPN addressing scheme."
    },
    "wireguard-malformed-key": {
      title: "WireGuard key has an invalid format",
      description: "A PrivateKey or PublicKey value does not look like a standard 44-character WireGuard base64 key.",
      recommendation: "Check that the key was copied fully and does not contain spaces, line breaks, or extra characters."
    },
    "wireguard-malformed-endpoint": {
      title: "Endpoint has an invalid format",
      description: "Endpoint should include a server address and port. An invalid format can make the connection fail or behave ambiguously.",
      recommendation: "Use host:port, for example vpn.example.org:51820, or [IPv6]:port for an IPv6 address."
    },
    "wireguard-full-tunnel-no-dns": {
      title: "Full tunnel is configured without DNS",
      description: "AllowedIPs sends all traffic through the VPN, but DNS is not set in [Interface]. This increases DNS leak risk.",
      recommendation: "Add a trusted DNS server to [Interface] and verify DNS behavior when the VPN connects and disconnects."
    },
    "wireguard-no-critical-issues": {
      title: "No critical WireGuard issues detected",
      description: "The basic configuration parameters do not contain known unsafe settings from the current rule set.",
      recommendation: "Also review file permissions, server-side policy, and connection monitoring."
    },
    "unknown-format": {
      title: "VPN configuration type was not recognized",
      description: "The application could not identify the file format as OpenVPN or WireGuard.",
      recommendation: "Load an OpenVPN .ovpn file or a WireGuard .conf file with [Interface]/[Peer] sections."
    }
  },
  kk: {
    "openvpn-weak-cipher": {
      title: "Әлсіз шифрлау алгоритмі анықталды",
      description: "OpenVPN конфигурациясында ескірген немесе қауіпсіз емес cipher көрсетілген. Мұндай алгоритмдер қорғалған арнаның тұрақтылығын төмендетеді.",
      recommendation: "AES-256-GCM немесе CHACHA20-POLY1305 сияқты заманауи AEAD алгоритмдерін қолданып, оларды data-ciphers арқылы көрсетіңіз."
    },
    "openvpn-no-cipher-policy": {
      title: "Шифрлау саясаты нақты көрсетілмеген",
      description: "Файлда cipher немесе data-ciphers директивалары табылмады. Нақты саясат болмаса, қорғаныс параметрлерін бақылау қиындайды.",
      recommendation: "Заманауи алгоритмдері бар data-ciphers мәнін көрсетіп, клиент пен сервер үйлесімділігін тексеріңіз."
    },
    "openvpn-weak-auth": {
      title: "Тұтастықты бақылаудың әлсіз алгоритмі қолданылған",
      description: "auth мәні SHA1, MD5 немесе тексерудің өшірілгенін көрсетеді. Бұл берілетін деректердің тұтастығына шабуыл қаупін арттырады.",
      recommendation: "SHA256/SHA384 немесе тұтастықты бақылауы шифрлау алгоритміне кіріктірілген AEAD режимдерін қолданыңыз."
    },
    "openvpn-no-remote-cert-tls": {
      title: "Сервер сертификатының мақсатын тексеру табылмады",
      description: "remote-cert-tls server болмаса, клиент қашықтағы тарап сертификатының мақсатын жеткілікті қатаң тексермеуі мүмкін.",
      recommendation: "remote-cert-tls server директивасын қосып, сертификаттар тізбегінің дұрыстығын тексеріңіз."
    },
    "openvpn-no-tls-hardening": {
      title: "TLS арнасын қосымша күшейту табылмады",
      description: "tls-auth немесе tls-crypt болмауы VPN серверін сканерлеуді және кейбір DoS сценарийлерін жеңілдетуі мүмкін.",
      recommendation: "Жаңа конфигурациялар үшін сервер қолдаса, tls-crypt қолданған дұрыс."
    },
    "openvpn-compression-enabled": {
      title: "Трафикті қысу қосылған",
      description: "VPN қосылымдарындағы қысу жанама арналар арқылы ақпараттың ағу қаупін тудыруы мүмкін және әдетте қорғалған туннельдерге ұсынылмайды.",
      recommendation: "Қатаң өндірістік қажеттілік болмаса, comp-lzo/compress параметрлерін өшіріңіз."
    },
    "openvpn-tcp-proto": {
      title: "OpenVPN TCP режимі қолданылған",
      description: "TCP тікелей осалдық емес, бірақ TCP-over-TCP әсерінен туннельдің тұрақтылығы мен өнімділігін төмендетуі мүмкін.",
      recommendation: "Желі саясаты рұқсат етсе, көп жағдайда UDP режимін қарастырыңыз."
    },
    "openvpn-no-auth-nocache": {
      title: "Клиент тіркелгі деректерін кэштеуі мүмкін",
      description: "Конфигурацияда auth-nocache директивасы табылмады. Бұл клиент құрылғысындағы парольдің ашылу қаупін арттыруы мүмкін.",
      recommendation: "Тіркелгі деректерінің клиент жадында сақталу уақытын азайту үшін auth-nocache қосыңыз."
    },
    "openvpn-no-tls-version-min": {
      title: "TLS минималды нұсқасы көрсетілмеген",
      description: "Конфигурацияда tls-version-min директивасы табылмады. Нақты шектеу болмаса, клиент әдепкі баптауларға және ескі протоколдармен үйлесімділікке тәуелді болуы мүмкін.",
      recommendation: "Сервер мен клиенттер қолдаса, tls-version-min 1.2 немесе одан жоғары мәнін қосыңыз."
    },
    "openvpn-weak-tls-version-min": {
      title: "Ескірген TLS нұсқасына рұқсат берілген",
      description: "tls-version-min директивасы TLS 1.2-ден төмен нұсқаларға рұқсат береді, бұл TLS арнасының криптографиялық беріктігін төмендетеді.",
      recommendation: "tls-version-min мәнін 1.2 немесе 1.3 етіп қойып, клиенттердің үйлесімділігін тексеріңіз."
    },
    "openvpn-no-verify-x509-name": {
      title: "Сервер сертификатының аты тексерілмейді",
      description: "verify-x509-name болмаса, клиент сертификат тізбегін тексеруі мүмкін, бірақ күтілетін сервер сәйкестігін жеткілікті нақты шектемеуі мүмкін.",
      recommendation: "Күтілетін сервер атымен және тиісті тексеру режимімен verify-x509-name қосыңыз."
    },
    "openvpn-dangerous-script-security": {
      title: "Сыртқы скрипттерді орындауға рұқсат берілген",
      description: "script-security 2 немесе 3 OpenVPN-ге сыртқы командалар мен скрипттерді іске қосуға мүмкіндік береді, бұл жергілікті код орындау қаупін арттырады.",
      recommendation: "script-security деңгейін ең төмен қажетті мәнге түсіріңіз немесе скрипттер қажет болмаса, директиваны алып тастаңыз."
    },
    "openvpn-script-hook": {
      title: "Скрипт іске қосатын hook анықталды",
      description: "up, down, route-up немесе learn-address сияқты директивалар VPN қосылымының кезеңдерінде жергілікті скрипттерді іске қоса алады.",
      recommendation: "Скрипт жолын, файл құқықтарын және қажеттілігін тексеріңіз. Қажет болмаса, hook директивасын алып тастаңыз."
    },
    "openvpn-inline-private-key": {
      title: "Конфигурацияда inline private key табылды",
      description: "Енгізілген жеке кілт конфигурация файлын сезімтал артефактқа айналдырады және кілттің ашылу қаупін арттырады.",
      recommendation: "Файлды қорғалған жерде сақтап, қол жеткізу құқықтарын шектеңіз және ашық арналар арқылы жібермеңіз."
    },
    "openvpn-no-critical-issues": {
      title: "OpenVPN бойынша критикалық мәселе табылмады",
      description: "Конфигурацияның негізгі параметрлерінде ағымдағы ережелер жиынындағы белгілі қауіпсіз емес баптаулар жоқ.",
      recommendation: "Қосымша сервер конфигурациясын, жаңарту саясатын, MFA және қосылу журналдарын тексеріңіз."
    },
    "wireguard-private-key-present": {
      title: "Конфигурацияда жеке кілт бар",
      description: "WireGuard үшін бұл қалыпты жағдай, бірақ PrivateKey бар файл сезімтал және файлдық жүйе деңгейінде қорғалуы керек.",
      recommendation: "Конфигурацияны қорғалған каталогта сақтап, қол жеткізу құқықтарын шектеңіз және файлды ашық арналар арқылы жібермеңіз."
    },
    "wireguard-no-interface-section": {
      title: "[Interface] секциясы табылмады",
      description: "[Interface] жоқ WireGuard конфигурациясында туннельдің жергілікті параметрлері көрсетілмейді және ол толық емес көрінеді.",
      recommendation: "Address, PrivateKey және басқа клиент параметрлері бар [Interface] секциясын қосыңыз."
    },
    "wireguard-no-peer-section": {
      title: "[Peer] секциясы табылмады",
      description: "[Peer] жоқ WireGuard конфигурациясы туннельдің қашықтағы тарапын сипаттамайды.",
      recommendation: "Клиент профилі үшін PublicKey, AllowedIPs және Endpoint бар [Peer] секциясын қосыңыз."
    },
    "wireguard-no-peer-key": {
      title: "Peer ашық кілті табылмады",
      description: "PublicKey болмаса, туннель қашықтағы тарапты сенімді түрде анықтай алмайды.",
      recommendation: "[Peer] секциясы мен PublicKey параметрінің бар екенін тексеріңіз."
    },
    "wireguard-no-endpoint": {
      title: "Endpoint көрсетілмеген",
      description: "Endpoint болмауы сервер жағы үшін рұқсат етілуі мүмкін, бірақ клиент конфигурациясында бұл жиі толық емес баптауды білдіреді.",
      recommendation: "Клиент профилі үшін сервер Endpoint мәнін host:port форматында көрсетіңіз."
    },
    "wireguard-no-allowed-ips": {
      title: "AllowedIPs көрсетілмеген",
      description: "AllowedIPs параметрі туннель арқылы маршруттауды анықтайды. Ол болмаса, қосылым әрекеті белгісіз болады.",
      recommendation: "AllowedIPs мәнін саясатқа сай көрсетіңіз: тек корпоративтік ішкі желілер немесе қажет болса толық туннель."
    },
    "wireguard-full-tunnel": {
      title: "Толық туннель режимі қосылған",
      description: "AllowedIPs = 0.0.0.0/0 немесе ::/0 барлық трафикті VPN арқылы жібереді. Бұл қате емес, бірақ дұрыс DNS және kill switch саясатын талап етеді.",
      recommendation: "VPN үзілген кездегі DNS, маршруттау және трафикті бұғаттау ережелерін тексеріңіз."
    },
    "wireguard-no-dns": {
      title: "Туннель үшін DNS көрсетілмеген",
      description: "Нақты DNS болмаса, кейбір сұраулар жүйелік резолверлер арқылы өтіп, DNS leak қаупін арттыруы мүмкін.",
      recommendation: "[Interface] секциясында сенімді DNS серверін көрсетіп, DNS утечкасы жоқ екенін тексеріңіз."
    },
    "wireguard-no-keepalive": {
      title: "PersistentKeepalive көрсетілмеген",
      description: "NAT артындағы клиенттер үшін PersistentKeepalive болмауы қосылым тұрақсыздығына әкелуі мүмкін.",
      recommendation: "Егер клиент NAT артында болса, PersistentKeepalive = 25 көрсетіңіз."
    },
    "wireguard-no-address": {
      title: "Интерфейс мекенжайы көрсетілмеген",
      description: "Address болмаса, WireGuard интерфейсі толық бапталмауы және туннельде күтілетін мекенжайды алмауы мүмкін.",
      recommendation: "VPN мекенжайлау схемасына сәйкес [Interface] секциясына Address қосыңыз."
    },
    "wireguard-malformed-key": {
      title: "WireGuard кілтінің форматы дұрыс емес",
      description: "PrivateKey немесе PublicKey мәні 44 таңбалы стандартты WireGuard base64 кілтіне ұқсамайды.",
      recommendation: "Кілт толық көшірілгенін және ішінде бос орын, жол ауысуы немесе артық таңба жоқ екенін тексеріңіз."
    },
    "wireguard-malformed-endpoint": {
      title: "Endpoint форматы дұрыс емес",
      description: "Endpoint сервер мекенжайы мен портты көрсетуі керек. Қате формат қосылымның істемеуіне немесе екіұшты баптауға әкелуі мүмкін.",
      recommendation: "host:port форматын қолданыңыз, мысалы vpn.example.org:51820, ал IPv6 үшін [IPv6]:port қолданыңыз."
    },
    "wireguard-full-tunnel-no-dns": {
      title: "Толық туннель DNS көрсетілмей бапталған",
      description: "AllowedIPs барлық трафикті VPN арқылы жібереді, бірақ [Interface] ішінде DNS көрсетілмеген. Бұл DNS leak қаупін арттырады.",
      recommendation: "[Interface] секциясына сенімді DNS қосып, VPN қосылғанда және ажырағанда DNS әрекетін тексеріңіз."
    },
    "wireguard-no-critical-issues": {
      title: "WireGuard бойынша критикалық мәселе табылмады",
      description: "Конфигурацияның негізгі параметрлерінде ағымдағы ережелер жиынындағы белгілі қауіпсіз емес баптаулар жоқ.",
      recommendation: "Қосымша файл құқықтарын, сервер саясатын және қосылым мониторингін тексеріңіз."
    },
    "unknown-format": {
      title: "VPN конфигурация түрі анықталмады",
      description: "Бағдарлама файл форматын OpenVPN немесе WireGuard ретінде анықтай алмады.",
      recommendation: "OpenVPN үшін .ovpn файлын немесе [Interface]/[Peer] секциялары бар WireGuard .conf файлын жүктеңіз."
    }
  }
} satisfies Record<Language, Record<FindingId, FindingCopy>>;

export function findingCopy(id: FindingId, language: Language) {
  return findingDictionaries[language][id];
}
