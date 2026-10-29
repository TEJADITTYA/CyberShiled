import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Dimensions,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  Share,
  StatusBar,
  StyleSheet,
  Modal,
  Text,
  TextInput,
  View,
} from "react-native";

import * as Location from "expo-location";
import { CameraView, useCameraPermissions } from "expo-camera";

const { width } = Dimensions.get("window");

/* =========================================================
   TYPES
========================================================= */

type Screen =
  | "home"
  | "dashboard"
  | "guard"
  | "liveSms"
  | "analyze"
  | "links"
  | "radar"
  | "history"
  | "contact"
  | "guide"
  | "more"
  | "result"
  | "qr";

type AnalysisResult = {
  score: number;
  classification: "SAFE" | "SUSPICIOUS" | "SCAM";
  summary: string;
  indicators: string[];
  recommendation: string;
  message: string;
  timestamp: string;
};

type ScanHistory = AnalysisResult[];

type LocationData = {
  latitude: number;
  longitude: number;
  accuracy: number | null;
  city?: string;
  region?: string;
  country?: string;
};

type IPData = {
  ip: string;
  city?: string;
  region?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  org?: string;
};

/* =========================================================
   CONSTANTS
========================================================= */

const COLORS = {
  bg: "#05070B",
  card: "#0C111A",
  card2: "#111925",
  border: "#1D2A3A",
  cyan: "#00E5FF",
  blue: "#4D7CFE",
  green: "#00E676",
  yellow: "#FFD740",
  red: "#FF3D71",
  white: "#F5F7FA",
  muted: "#8290A3",
  darkText: "#061018",
};

const MAX_HISTORY = 50;

/* =========================================================
   MAIN APP
========================================================= */

export default function App() {
  const [screen, setScreen] = useState<Screen>("home");

  const [message, setMessage] = useState("");
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);

  const [history, setHistory] = useState<ScanHistory>([]);

  const [location, setLocation] = useState<LocationData | null>(null);
  const [ipData, setIpData] = useState<IPData | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [reportText, setReportText] = useState("");
  const [reportVisible, setReportVisible] = useState(false);

  const [linkInput, setLinkInput] = useState("");
  const [linkResult, setLinkResult] = useState<AnalysisResult | null>(null);

  const [smsInput, setSmsInput] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactLinked, setContactLinked] = useState(false);

  const [cameraPermission, requestCameraPermission] =
    useCameraPermissions();

  const pulse = useRef(new Animated.Value(0)).current;
  const radarRotation = useRef(new Animated.Value(0)).current;
  const neuralScan = useRef(new Animated.Value(0)).current;

  /* =========================================================
     ANIMATIONS
  ========================================================= */

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 1800,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 1800,
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.timing(radarRotation, {
        toValue: 1,
        duration: 5000,
        useNativeDriver: true,
      })
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(neuralScan, {
          toValue: 1,
          duration: 3200,
          useNativeDriver: true,
        }),
        Animated.timing(neuralScan, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  /* =========================================================
     LOCATION
  ========================================================= */

  const getDeviceLocation = async () => {
    try {
      setLocationLoading(true);

      const servicesEnabled = await Location.hasServicesEnabledAsync();
      if (!servicesEnabled) {
        Alert.alert(
          "Location Services Off",
          "Please turn on Location/GPS on your phone and tap Refresh Radar again."
        );
        setLocationLoading(false);
        return;
      }

      const { status } =
        await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        Alert.alert(
          "Location Permission",
          "Location permission is required to display your device location."
        );
        setLocationLoading(false);
        return;
      }

      const current =
        await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

      let address: Location.LocationGeocodedAddress[] = [];

      try {
        address = await Location.reverseGeocodeAsync({
          latitude: current.coords.latitude,
          longitude: current.coords.longitude,
        });
      } catch {
        // Reverse geocoding can fail without affecting GPS coordinates.
      }

      const first = address[0];

      setLocation({
        latitude: current.coords.latitude,
        longitude: current.coords.longitude,
        accuracy: current.coords.accuracy,
        city: first?.city || first?.district || undefined,
        region: first?.region || undefined,
        country: first?.country || undefined,
      });

      setLocationLoading(false);
    } catch (error) {
      console.log(error);
      setLocationLoading(false);

      Alert.alert(
        "Location Error",
        "Unable to obtain the device location."
      );
    }
  };

  /* =========================================================
     PUBLIC IP
  ========================================================= */

  const fetchWithTimeout = async (url: string, timeoutMs = 8000) => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      return await fetch(url, {
        method: "GET",
        headers: { Accept: "application/json" },
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timer);
    }
  };

  const getPublicIP = async () => {
    try {
      const response = await fetchWithTimeout("https://ipapi.co/json/");
      if (!response.ok) throw new Error(`IP service returned ${response.status}`);

      const data = await response.json();

      if (data?.ip) {
        setIpData({
          ip: String(data.ip),
          city: data.city || undefined,
          region: data.region || undefined,
          country: data.country_name || data.country || undefined,
          latitude: typeof data.latitude === "number" ? data.latitude : undefined,
          longitude: typeof data.longitude === "number" ? data.longitude : undefined,
          org: data.org || undefined,
        });
        return;
      }

      throw new Error("IP address was not returned");
    } catch (error) {
      console.log("Primary IP lookup failed:", error);

      try {
        const fallback = await fetchWithTimeout("https://api.ipify.org?format=json");
        if (!fallback.ok) throw new Error(`Fallback IP service returned ${fallback.status}`);

        const data = await fallback.json();
        if (data?.ip) {
          setIpData({ ip: String(data.ip) });
          return;
        }
      } catch (fallbackError) {
        console.log("Fallback IP lookup failed:", fallbackError);
      }

      setIpData(null);
    }
  };
  const refreshRadar = async () => {
    await Promise.all([
      getDeviceLocation(),
      getPublicIP(),
    ]);
  };

  /* =========================================================
     MESSAGE ANALYZER
  ========================================================= */

  const analyzeMessage = (input?: string) => {
    const text = (input ?? message).trim();

    if (!text) {
      Alert.alert(
        "Message Required",
        "Please enter a message to analyze."
      );
      return;
    }

    const lower = text.toLowerCase();

    let score = 0;
    const indicators: string[] = [];

    /* Urgency */
    const urgencyWords = [
      "urgent",
      "immediately",
      "act now",
      "within 24 hours",
      "last chance",
      "expires today",
      "hurry",
      "quickly",
    ];

    if (urgencyWords.some((word) => lower.includes(word))) {
      score += 15;
      indicators.push(
        "Urgency or pressure language detected"
      );
    }

    /* OTP */
    if (
      lower.includes("otp") ||
      lower.includes("one time password") ||
      lower.includes("verification code")
    ) {
      score += 25;
      indicators.push(
        "OTP or verification-code request detected"
      );
    }

    /* Money */
    const financialWords = [
      "send money",
      "transfer money",
      "payment",
      "pay now",
      "upi",
      "bank account",
      "credit card",
      "debit card",
      "refund fee",
      "processing fee",
      "investment",
      "deposit",
    ];

    if (
      financialWords.some((word) =>
        lower.includes(word)
      )
    ) {
      score += 25;
      indicators.push(
        "Financial or payment-related request detected"
      );
    }

    /* Prize */
    const prizeWords = [
      "winner",
      "won",
      "lottery",
      "prize",
      "reward",
      "cash prize",
      "lucky draw",
      "congratulations",
    ];

    if (
      prizeWords.some((word) =>
        lower.includes(word)
      )
    ) {
      score += 20;
      indicators.push(
        "Prize, reward or lottery language detected"
      );
    }

    /* Account */
    const accountWords = [
      "account blocked",
      "account suspended",
      "verify your account",
      "kyc",
      "update kyc",
      "login",
      "password",
      "credentials",
    ];

    if (
      accountWords.some((word) =>
        lower.includes(word)
      )
    ) {
      score += 15;
      indicators.push(
        "Account verification or credential request detected"
      );
    }

    /* Link */
    const hasUrl =
      /(https?:\/\/|www\.|bit\.ly|tinyurl|t\.co\/|\.com\/|\.in\/)/i.test(
        text
      );

    if (hasUrl) {
      score += 20;
      indicators.push(
        "Potentially suspicious external link detected"
      );
    }

    /* Impersonation */
    const impersonationWords = [
      "support team",
      "customer care",
      "bank official",
      "police",
      "government",
      "income tax",
      "official account",
      "security team",
    ];

    if (
      impersonationWords.some((word) =>
        lower.includes(word)
      )
    ) {
      score += 15;
      indicators.push(
        "Possible authority or brand impersonation detected"
      );
    }

    /* Job scams */
    const jobWords = [
      "work from home",
      "earn money",
      "part time job",
      "job offer",
      "registration fee",
      "joining fee",
      "easy income",
    ];

    if (
      jobWords.some((word) =>
        lower.includes(word)
      )
    ) {
      score += 15;
      indicators.push(
        "Potential job or easy-income scam pattern detected"
      );
    }

    /* Generic suspicious patterns */
    if (
      lower.includes("click this link") ||
      lower.includes("click here") ||
      lower.includes("send otp") ||
      lower.includes("share otp") ||
      lower.includes("share your password")
    ) {
      score += 20;
      indicators.push(
        "Potential social-engineering instruction detected"
      );
    }

    score = Math.min(score, 100);

    let classification: AnalysisResult["classification"];

    if (score >= 60) {
      classification = "SCAM";
    } else if (score >= 30) {
      classification = "SUSPICIOUS";
    } else {
      classification = "SAFE";
    }

    let summary = "";
    let recommendation = "";

    if (classification === "SCAM") {
      summary =
        "The message contains multiple indicators commonly associated with fraudulent or social-engineering content.";

      recommendation =
        "Do not click suspicious links, share OTPs, passwords or financial information. Verify the sender through an official channel before taking action.";
    } else if (classification === "SUSPICIOUS") {
      summary =
        "The message contains several signals that require additional verification before you interact with it.";

      recommendation =
        "Verify the sender independently. Avoid sharing sensitive information or making payments until the message is confirmed.";
    } else {
      summary =
        "No strong scam indicators were detected in the provided message.";

      recommendation =
        "Continue using normal security precautions and verify unexpected requests through trusted channels.";
    }

    const result: AnalysisResult = {
      score,
      classification,
      summary,
      indicators:
        indicators.length > 0
          ? indicators
          : ["No major risk indicators detected"],
      recommendation,
      message: text,
      timestamp: new Date().toLocaleString(),
    };

    setAnalysis(result);

    setHistory((previous) => [
      result,
      ...previous,
    ].slice(0, MAX_HISTORY));

    setScreen("result");
  };

  /* =========================================================
     LINK ANALYZER
  ========================================================= */

  const analyzeLink = () => {
    const link = linkInput.trim();

    if (!link) {
      Alert.alert(
        "Link Required",
        "Enter a URL to analyze."
      );
      return;
    }

    let score = 0;
    const indicators: string[] = [];

    const lower = link.toLowerCase();

    if (!/^https:\/\//i.test(link)) {
      score += 20;
      indicators.push(
        "Link does not use HTTPS"
      );
    }

    if (
      lower.includes("bit.ly") ||
      lower.includes("tinyurl") ||
      lower.includes("t.co")
    ) {
      score += 25;
      indicators.push(
        "URL shortener detected"
      );
    }

    if (
      lower.includes("@") ||
      lower.includes("%40")
    ) {
      score += 25;
      indicators.push(
        "URL contains a suspicious @ pattern"
      );
    }

    const suspiciousWords = [
      "login",
      "verify",
      "account",
      "secure",
      "payment",
      "wallet",
      "bonus",
      "prize",
      "claim",
      "free",
      "gift",
    ];

    if (
      suspiciousWords.some((word) =>
        lower.includes(word)
      )
    ) {
      score += 20;
      indicators.push(
        "URL contains words commonly used in deceptive links"
      );
    }

    if ((link.match(/\./g) || []).length >= 4) {
      score += 15;
      indicators.push(
        "Unusually complex domain structure detected"
      );
    }

    score = Math.min(score, 100);

    const classification =
      score >= 60
        ? "SCAM"
        : score >= 30
        ? "SUSPICIOUS"
        : "SAFE";

    const result: AnalysisResult = {
      score,
      classification,
      summary:
        classification === "SCAM"
          ? "The URL contains multiple suspicious characteristics."
          : classification === "SUSPICIOUS"
          ? "The URL contains characteristics that should be verified before opening."
          : "No strong structural warning signs were detected.",
      indicators:
        indicators.length > 0
          ? indicators
          : ["No major URL indicators detected"],
      recommendation:
        classification === "SAFE"
          ? "Still verify the website before entering credentials or payment information."
          : "Do not enter passwords, OTPs or payment details until the destination is independently verified.",
      message: link,
      timestamp: new Date().toLocaleString(),
    };

    setLinkResult(result);
  };

  /* =========================================================
     REPORT GENERATION
  ========================================================= */

  const generateReport = async (
    result: AnalysisResult
  ) => {
    const report = `
CYBER SHIELD
SECURITY ANALYSIS REPORT
================================

Classification:
${result.classification}

Risk Score:
${result.score}/100

Analysis Time:
${result.timestamp}

--------------------------------
ANALYZED CONTENT
--------------------------------

${result.message}

--------------------------------
SUMMARY
--------------------------------

${result.summary}

--------------------------------
RISK INDICATORS
--------------------------------

${result.indicators
  .map((item, index) => `${index + 1}. ${item}`)
  .join("\n")}

--------------------------------
RECOMMENDATION
--------------------------------

${result.recommendation}

================================
Cyber Shield
AI-Powered Scam & Fraud Detection
================================
`;

    setReportText(report.trim());
    setReportVisible(true);
  };

  const shareReport = async () => {
    if (!reportText.trim()) return;

    try {
      await Share.share({
        title: "Cyber Shield Security Report",
        message: reportText,
      });
    } catch (error) {
      console.log("Report sharing failed:", error);
      Alert.alert("Sharing Unavailable", "The report was generated successfully, but the system share sheet could not be opened.");
    }
  };

  /* =========================================================
     QR SCANNER
  ========================================================= */

  const openQRScanner = async () => {
    if (!cameraPermission?.granted) {
      const permission =
        await requestCameraPermission();

      if (!permission.granted) {
        Alert.alert(
          "Camera Permission",
          "Camera access is required to scan QR codes."
        );
        return;
      }
    }

    setScreen("qr");
  };

  const handleBarcodeScanned = ({
    data,
  }: {
    data: string;
  }) => {
    setScreen("links");
    setLinkInput(data);

    setTimeout(() => {
      analyzeLinkFromValue(data);
    }, 200);
  };

  const analyzeLinkFromValue = (link: string) => {
    let score = 0;
    const indicators: string[] = [];

    const lower = link.toLowerCase();

    if (!/^https:\/\//i.test(link)) {
      score += 20;
      indicators.push(
        "Link does not use HTTPS"
      );
    }

    if (
      lower.includes("bit.ly") ||
      lower.includes("tinyurl") ||
      lower.includes("t.co")
    ) {
      score += 25;
      indicators.push(
        "URL shortener detected"
      );
    }

    if (
      lower.includes("login") ||
      lower.includes("verify") ||
      lower.includes("payment") ||
      lower.includes("prize") ||
      lower.includes("claim")
    ) {
      score += 25;
      indicators.push(
        "Potentially sensitive or deceptive URL keywords detected"
      );
    }

    score = Math.min(score, 100);

    const classification =
      score >= 60
        ? "SCAM"
        : score >= 30
        ? "SUSPICIOUS"
        : "SAFE";

    setLinkResult({
      score,
      classification,
      summary:
        classification === "SCAM"
          ? "The scanned QR destination contains multiple warning signs."
          : classification === "SUSPICIOUS"
          ? "The scanned destination requires verification."
          : "No major structural warning signs were detected.",
      indicators:
        indicators.length > 0
          ? indicators
          : ["No major indicators detected"],
      recommendation:
        "Verify the destination before opening it or entering personal information.",
      message: link,
      timestamp: new Date().toLocaleString(),
    });
  };

  /* =========================================================
     UI HELPERS
  ========================================================= */

  const riskColor = (score: number) => {
    if (score >= 60) return COLORS.red;
    if (score >= 30) return COLORS.yellow;
    return COLORS.green;
  };

  const classificationColor = (
    classification: AnalysisResult["classification"]
  ) => {
    if (classification === "SCAM") {
      return COLORS.red;
    }

    if (classification === "SUSPICIOUS") {
      return COLORS.yellow;
    }

    return COLORS.green;
  };

  const renderTopBar = (
    title: string,
    subtitle?: string,
    back = false
  ) => (
    <View style={styles.topBar}>
      <View style={styles.topBarLeft}>
        {back && (
          <Pressable
            onPress={() => setScreen("home")}
            style={styles.backButton}
          >
            <Text style={styles.backText}>‹</Text>
          </Pressable>
        )}

        <View>
          <Text style={styles.appTitle}>
            {title}
          </Text>

          {subtitle && (
            <Text style={styles.appSubtitle}>
              {subtitle}
            </Text>
          )}
        </View>
      </View>

      <View style={styles.aiBadge}>
        <View style={styles.onlineDot} />
        <Text style={styles.aiText}>
          AI ACTIVE
        </Text>
      </View>
    </View>
  );

  /* =========================================================
     CYBER GRAPHIC
  ========================================================= */

  const CyberGraphic = () => {
    const scale = pulse.interpolate({
      inputRange: [0, 1],
      outputRange: [0.92, 1.06],
    });

    const opacity = pulse.interpolate({
      inputRange: [0, 1],
      outputRange: [0.15, 0.45],
    });

    return (
      <View style={styles.graphicContainer}>
        <Animated.View
          style={[
            styles.glowCircle,
            {
              transform: [{ scale }],
              opacity,
            },
          ]}
        />

        <View style={[styles.ring, styles.ringOne]} />
        <View style={[styles.ring, styles.ringTwo]} />
        <View style={[styles.ring, styles.ringThree]} />

        <View style={styles.shieldGraphic}>
          <Text style={styles.shieldIcon}>
            🛡
          </Text>
        </View>

        <View
          style={[
            styles.graphicNode,
            styles.nodeOne,
          ]}
        />
        <View
          style={[
            styles.graphicNode,
            styles.nodeTwo,
          ]}
        />
        <View
          style={[
            styles.graphicNode,
            styles.nodeThree,
          ]}
        />
        <View
          style={[
            styles.graphicNode,
            styles.nodeFour,
          ]}
        />
      </View>
    );
  };

  /* =========================================================
     THREAT INTELLIGENCE NEURAL GRID
  ========================================================= */

  const NeuralGrid = () => {
    const scanY = neuralScan.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 1],
    });

    const nodeOpacity = pulse.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [0.58, 1, 0.72],
    });

    const nodeScale = pulse.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [0.88, 1.16, 0.96],
    });

    return (
      <View style={styles.neuralCard}>
        <View style={styles.neuralHeader}>
          <View>
            <Text style={styles.neuralEyebrow}>
              THREAT INTELLIGENCE NEURAL GRID
            </Text>
            <Text style={styles.neuralSubtitle}>
              Connected AI security signal visualization
            </Text>
          </View>

          <View style={styles.liveBadge}>
            <Animated.View
              style={[
                styles.liveDot,
                { opacity: nodeOpacity },
              ]}
            />
            <Text style={styles.liveText}>LIVE</Text>
          </View>
        </View>

        <View style={styles.neuralViewport}>
          <View style={styles.neuralGridBase} />

          {Array.from({ length: 9 }).map((_, index) => (
            <View
              key={`v-${index}`}
              style={[
                styles.neuralGridVertical,
                { left: `${index * 12.5}%` },
              ]}
            />
          ))}

          {Array.from({ length: 7 }).map((_, index) => (
            <View
              key={`h-${index}`}
              style={[
                styles.neuralGridHorizontal,
                { top: `${index * 16.6}%` },
              ]}
            />
          ))}

          <Animated.View
            pointerEvents="none"
            style={[
              styles.neuralScanBeam,
              {
                top: scanY.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 210],
                }),
                opacity: scanY.interpolate({
                  inputRange: [0, 0.15, 0.8, 1],
                  outputRange: [0, 0.9, 0.55, 0],
                }),
              },
            ]}
          />

          <NeuralLine style={styles.neuralLineOne} color={COLORS.green} />
          <NeuralLine style={styles.neuralLineTwo} color={COLORS.cyan} />
          <NeuralLine style={styles.neuralLineThree} color={COLORS.green} />
          <NeuralLine style={styles.neuralLineFour} color="#9B6CFF" />
          <NeuralLine style={styles.neuralLineFive} color={COLORS.cyan} />

          <NeuralNode
            style={styles.neuralNodeOne}
            color={COLORS.green}
            pulse={pulse}
          />
          <NeuralNode
            style={styles.neuralNodeTwo}
            color="#0BBF83"
            pulse={pulse}
          />
          <NeuralNode
            style={styles.neuralNodeThree}
            color={COLORS.cyan}
            pulse={pulse}
          />
          <NeuralNode
            style={styles.neuralNodeFour}
            color="#9B6CFF"
            pulse={pulse}
          />
          <NeuralNode
            style={styles.neuralNodeFive}
            color={COLORS.cyan}
            pulse={pulse}
          />
          <NeuralNode
            style={styles.neuralNodeSix}
            color={COLORS.green}
            pulse={pulse}
          />

          <Animated.View
            style={[
              styles.neuralCore,
              {
                opacity: nodeOpacity,
                transform: [{ scale: nodeScale }],
              },
            ]}
          >
            <Text style={styles.neuralCoreIcon}>◈</Text>
          </Animated.View>

          <View style={styles.neuralStatusRow}>
            <Text style={styles.neuralStatusText}>
              NLP  •  URL  •  RISK  •  THREAT
            </Text>
          </View>
        </View>
      </View>
    );
  };

  /* =========================================================
     HOME
  ========================================================= */

  const renderHome = () => (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
    >
      {renderTopBar(
        "Cyber Shield",
        "AI-Powered Security Layer"
      )}

      <View style={styles.heroCard}>
        <View style={styles.heroText}>
          <Text style={styles.heroSmall}>
            DIGITAL THREAT DEFENSE
          </Text>

          <Text style={styles.heroTitle}>
            Detect scams{"\n"}
            before they{"\n"}
            become a threat.
          </Text>

          <Text style={styles.heroDescription}>
            Analyze suspicious messages, links and
            QR codes using AI-powered security
            analysis.
          </Text>
        </View>

        <CyberGraphic />
      </View>

      <NeuralGrid />

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>
            AI
          </Text>
          <Text style={styles.statLabel}>
            Analysis
          </Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statNumber}>
            URL
          </Text>
          <Text style={styles.statLabel}>
            Detection
          </Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statNumber}>
            QR
          </Text>
          <Text style={styles.statLabel}>
            Guard
          </Text>
        </View>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>
          Security Tools
        </Text>
      </View>

      <View style={styles.toolGrid}>
        <Pressable
          style={styles.toolCard}
          onPress={() => setScreen("analyze")}
        >
          <Text style={styles.toolIcon}>
            🧠
          </Text>
          <Text style={styles.toolTitle}>
            Analyze Message
          </Text>
          <Text style={styles.toolDescription}>
            Detect scam patterns
          </Text>
        </Pressable>

        <Pressable
          style={styles.toolCard}
          onPress={() => setScreen("links")}
        >
          <Text style={styles.toolIcon}>
            🔗
          </Text>
          <Text style={styles.toolTitle}>
            Link Scanner
          </Text>
          <Text style={styles.toolDescription}>
            Inspect suspicious URLs
          </Text>
        </Pressable>

        <Pressable
          style={styles.toolCard}
          onPress={openQRScanner}
        >
          <Text style={styles.toolIcon}>
            📷
          </Text>
          <Text style={styles.toolTitle}>
            QR Guard
          </Text>
          <Text style={styles.toolDescription}>
            Scan QR destinations
          </Text>
        </Pressable>

        <Pressable
          style={styles.toolCard}
          onPress={() => {
            setScreen("radar");
            refreshRadar();
          }}
        >
          <Text style={styles.toolIcon}>
            📡
          </Text>
          <Text style={styles.toolTitle}>
            IP Radar
          </Text>
          <Text style={styles.toolDescription}>
            Location intelligence
          </Text>
        </Pressable>
      </View>

      <View style={styles.historyPreview}>
        <View style={styles.historyHeader}>
          <Text style={styles.sectionTitle}>
            Recent Analysis
          </Text>

          <Pressable
            onPress={() => setScreen("guard")}
          >
            <Text style={styles.viewAll}>
              Security Center
            </Text>
          </Pressable>
        </View>

        {history.length === 0 ? (
          <Text style={styles.emptyText}>
            No scans yet. Analyze a message to
            create your first security report.
          </Text>
        ) : (
          history.slice(0, 3).map((item, index) => (
            <Pressable
              key={index}
              style={styles.historyItem}
              onPress={() => {
                setAnalysis(item);
                setScreen("result");
              }}
            >
              <View
                style={[
                  styles.historyDot,
                  {
                    backgroundColor:
                      classificationColor(
                        item.classification
                      ),
                  },
                ]}
              />

              <View style={{ flex: 1 }}>
                <Text
                  numberOfLines={1}
                  style={styles.historyMessage}
                >
                  {item.message}
                </Text>

                <Text style={styles.historyTime}>
                  {item.timestamp}
                </Text>
              </View>

              <Text
                style={[
                  styles.historyScore,
                  {
                    color: riskColor(
                      item.score
                    ),
                  },
                ]}
              >
                {item.score}
              </Text>
            </Pressable>
          ))
        )}
      </View>
    </ScrollView>
  );

  /* =========================================================
     ANALYZER
  ========================================================= */

  const renderAnalyzer = () => (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
    >
      {renderTopBar(
        "Message Analyzer",
        "AI Threat Detection"
      )}

      <View style={styles.analyzerIntro}>
        <Text style={styles.analyzerIcon}>
          🧠
        </Text>

        <View style={{ flex: 1 }}>
          <Text style={styles.cardTitle}>
            Analyze suspicious content
          </Text>

          <Text style={styles.cardDescription}>
            Paste a message to identify urgency,
            financial requests, suspicious links,
            impersonation and other risk signals.
          </Text>
        </View>
      </View>

      <View style={styles.inputCard}>
        <Text style={styles.inputLabel}>
          MESSAGE CONTENT
        </Text>

        <TextInput
          value={message}
          onChangeText={setMessage}
          multiline
          placeholder="Paste the suspicious message here..."
          placeholderTextColor="#536274"
          style={styles.messageInput}
          textAlignVertical="top"
        />

        <View style={styles.characterRow}>
          <Text style={styles.characterCount}>
            {message.length} characters
          </Text>

          <Pressable
            onPress={() =>
              setMessage(
                "URGENT! Congratulations, you have won a prize. Click this link immediately and share your OTP to claim your reward."
              )
            }
          >
            <Text style={styles.exampleText}>
              Load Example
            </Text>
          </Pressable>
        </View>
      </View>

      <Pressable
        style={styles.primaryButton}
        onPress={() => analyzeMessage()}
      >
        <Text style={styles.primaryButtonIcon}>
          ◉
        </Text>
        <Text style={styles.primaryButtonText}>
          Analyze Message
        </Text>
      </Pressable>

      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>
          What Cyber Shield checks
        </Text>

        <View style={styles.checkRow}>
          <Text style={styles.checkIcon}>✓</Text>
          <Text style={styles.checkText}>
            Suspicious language patterns
          </Text>
        </View>

        <View style={styles.checkRow}>
          <Text style={styles.checkIcon}>✓</Text>
          <Text style={styles.checkText}>
            Urgency and social engineering
          </Text>
        </View>

        <View style={styles.checkRow}>
          <Text style={styles.checkIcon}>✓</Text>
          <Text style={styles.checkText}>
            Financial and OTP requests
          </Text>
        </View>

        <View style={styles.checkRow}>
          <Text style={styles.checkIcon}>✓</Text>
          <Text style={styles.checkText}>
            Suspicious links and offers
          </Text>
        </View>
      </View>
    </ScrollView>
  );

  /* =========================================================
     RESULT
  ========================================================= */

  const renderResult = () => {
    if (!analysis) {
      return null;
    }

    const color =
      classificationColor(
        analysis.classification
      );

    return (
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {renderTopBar(
          "Security Report",
          "Analysis Result",
          true
        )}

        <View
          style={[
            styles.resultHero,
            {
              borderColor: color,
            },
          ]}
        >
          <View
            style={[
              styles.resultStatusCircle,
              {
                borderColor: color,
              },
            ]}
          >
            <Text
              style={[
                styles.resultScore,
                {
                  color,
                },
              ]}
            >
              {analysis.score}
            </Text>

            <Text style={styles.scoreSmall}>
              /100
            </Text>
          </View>

          <Text
            style={[
              styles.classification,
              {
                color,
              },
            ]}
          >
            {analysis.classification}
          </Text>

          <Text style={styles.resultSummary}>
            {analysis.summary}
          </Text>
        </View>

        <View style={styles.reportSection}>
          <Text style={styles.reportSectionTitle}>
            Risk Indicators
          </Text>

          {analysis.indicators.map(
            (indicator, index) => (
              <View
                style={styles.indicatorRow}
                key={index}
              >
                <View
                  style={[
                    styles.indicatorNumber,
                    {
                      backgroundColor:
                        color,
                    },
                  ]}
                >
                  <Text
                    style={
                      styles.indicatorNumberText
                    }
                  >
                    {index + 1}
                  </Text>
                </View>

                <Text
                  style={styles.indicatorText}
                >
                  {indicator}
                </Text>
              </View>
            )
          )}
        </View>

        <View style={styles.reportSection}>
          <Text style={styles.reportSectionTitle}>
            Security Recommendation
          </Text>

          <View style={styles.recommendationBox}>
            <Text style={styles.recommendationIcon}>
              🛡️
            </Text>

            <Text
              style={styles.recommendationText}
            >
              {analysis.recommendation}
            </Text>
          </View>
        </View>

        <View style={styles.reportSection}>
          <Text style={styles.reportSectionTitle}>
            Analyzed Content
          </Text>

          <View style={styles.contentBox}>
            <Text style={styles.contentText}>
              {analysis.message}
            </Text>
          </View>
        </View>

        <Pressable
          style={styles.primaryButton}
          onPress={() =>
            generateReport(analysis)
          }
        >
          <Text style={styles.primaryButtonIcon}>
            ↓
          </Text>

          <Text style={styles.primaryButtonText}>
            Generate & Share Report
          </Text>
        </Pressable>

        <Pressable
          style={styles.secondaryButton}
          onPress={() => setScreen("analyze")}
        >
          <Text style={styles.secondaryButtonText}>
            Analyze Another Message
          </Text>
        </Pressable>
      </ScrollView>
    );
  };

  /* =========================================================
     LINKS
  ========================================================= */

  const renderLinks = () => (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
    >
      {renderTopBar(
        "Link Scanner",
        "URL Threat Analysis"
      )}

      <View style={styles.largeToolGraphic}>
        <Text style={styles.largeToolIcon}>
          🔗
        </Text>

        <Text style={styles.largeToolTitle}>
          Inspect a suspicious URL
        </Text>

        <Text style={styles.largeToolDescription}>
          Check URL structure and common deceptive
          patterns before opening the destination.
        </Text>
      </View>

      <View style={styles.inputCard}>
        <Text style={styles.inputLabel}>
          URL
        </Text>

        <TextInput
          value={linkInput}
          onChangeText={setLinkInput}
          placeholder="https://example.com/..."
          placeholderTextColor="#536274"
          autoCapitalize="none"
          autoCorrect={false}
          style={styles.urlInput}
        />
      </View>

      <Pressable
        style={styles.primaryButton}
        onPress={analyzeLink}
      >
        <Text style={styles.primaryButtonIcon}>
          ◉
        </Text>

        <Text style={styles.primaryButtonText}>
          Scan Link
        </Text>
      </Pressable>

      <Pressable
        style={styles.secondaryButton}
        onPress={openQRScanner}
      >
        <Text style={styles.secondaryButtonText}>
          📷 Scan QR Code Instead
        </Text>
      </Pressable>

      {linkResult && (
        <View style={styles.linkResult}>
          <View style={styles.linkResultTop}>
            <Text style={styles.cardTitle}>
              Scan Result
            </Text>

            <Text
              style={[
                styles.resultBadge,
                {
                  color:
                    classificationColor(
                      linkResult.classification
                    ),
                  borderColor:
                    classificationColor(
                      linkResult.classification
                    ),
                },
              ]}
            >
              {linkResult.classification}
            </Text>
          </View>

          <Text style={styles.linkScore}>
            Risk Score:{" "}
            <Text
              style={{
                color: riskColor(
                  linkResult.score
                ),
              }}
            >
              {linkResult.score}/100
            </Text>
          </Text>

          {linkResult.indicators.map(
            (indicator, index) => (
              <View
                key={index}
                style={styles.checkRow}
              >
                <Text style={styles.warningIcon}>
                  !
                </Text>

                <Text style={styles.checkText}>
                  {indicator}
                </Text>
              </View>
            )
          )}

          <Text style={styles.recommendationText}>
            {linkResult.recommendation}
          </Text>

          <Pressable
            style={styles.smallButton}
            onPress={() =>
              generateReport(linkResult)
            }
          >
            <Text style={styles.smallButtonText}>
              Generate Link Report
            </Text>
          </Pressable>
        </View>
      )}
    </ScrollView>
  );

  /* =========================================================
     IP RADAR
  ========================================================= */

  const renderRadar = () => {
    const rotate = radarRotation.interpolate({
      inputRange: [0, 1],
      outputRange: ["0deg", "360deg"],
    });

    return (
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {renderTopBar(
          "IP Radar",
          "Location Intelligence"
        )}

        <View style={styles.radarCard}>
          <View style={styles.radarVisual}>
            <View style={styles.radarCircleLarge} />
            <View style={styles.radarCircleMedium} />
            <View style={styles.radarCircleSmall} />

            <Animated.View
              style={[
                styles.radarSweep,
                {
                  transform: [
                    {
                      rotate,
                    },
                  ],
                },
              ]}
            />

            <View style={styles.radarCenter}>
              <Text style={styles.radarCenterIcon}>
                📡
              </Text>
            </View>

            {location && (
              <View style={styles.radarPoint} />
            )}
          </View>

          <Text style={styles.radarTitle}>
            {locationLoading
              ? "Scanning location..."
              : "Location Radar"}
          </Text>

          <Text style={styles.radarDescription}>
            Device GPS location and public IP
            information are displayed separately.
          </Text>
        </View>

        <Pressable
          style={styles.primaryButton}
          onPress={refreshRadar}
          disabled={locationLoading}
        >
          <Text style={styles.primaryButtonIcon}>
            ⟳
          </Text>

          <Text style={styles.primaryButtonText}>
            {locationLoading
              ? "Scanning..."
              : "Refresh Radar"}
          </Text>
        </Pressable>

        <View style={styles.locationCard}>
          <View style={styles.locationHeader}>
            <Text style={styles.cardTitle}>
              📍 Device Location
            </Text>

            <View style={styles.radarLiveBadge}>
              <View style={styles.onlineDot} />
              <Text style={styles.radarLiveText}>
                GPS
              </Text>
            </View>
          </View>

          {!location ? (
            <Text style={styles.emptyText}>
              Location has not been loaded yet.
              Tap Refresh Radar and allow location
              permission.
            </Text>
          ) : (
            <>
              <InfoRow
                label="Latitude"
                value={location.latitude.toFixed(6)}
              />

              <InfoRow
                label="Longitude"
                value={location.longitude.toFixed(6)}
              />

              <InfoRow
                label="Accuracy"
                value={
                  location.accuracy
                    ? `${Math.round(
                        location.accuracy
                      )} m`
                    : "Unavailable"
                }
              />

              <InfoRow
                label="City"
                value={
                  location.city || "Unavailable"
                }
              />

              <InfoRow
                label="Region"
                value={
                  location.region || "Unavailable"
                }
              />

              <InfoRow
                label="Country"
                value={
                  location.country || "Unavailable"
                }
              />
            </>
          )}
        </View>

        <View style={styles.locationCard}>
          <View style={styles.locationHeader}>
            <Text style={styles.cardTitle}>
              🌐 Public IP
            </Text>

            <View style={styles.radarLiveBadge}>
              <View style={styles.onlineDot} />
              <Text style={styles.radarLiveText}>
                NETWORK
              </Text>
            </View>
          </View>

          {!ipData ? (
            <Text style={styles.emptyText}>
              Public IP information is unavailable.
              Tap Refresh Radar to try again.
            </Text>
          ) : (
            <>
              <InfoRow
                label="IP Address"
                value={ipData.ip}
              />

              <InfoRow
                label="City"
                value={
                  ipData.city || "Unavailable"
                }
              />

              <InfoRow
                label="Region"
                value={
                  ipData.region || "Unavailable"
                }
              />

              <InfoRow
                label="Country"
                value={
                  ipData.country || "Unavailable"
                }
              />

              <InfoRow
                label="Organization"
                value={
                  ipData.org || "Unavailable"
                }
              />
            </>
          )}
        </View>

        <View style={styles.noticeCard}>
          <Text style={styles.noticeIcon}>
            ℹ
          </Text>

          <Text style={styles.noticeText}>
            GPS location identifies the device's
            physical location with permission.
            Public IP information is a separate
            network-level signal and may represent
            the ISP or another nearby location.
          </Text>
        </View>
      </ScrollView>
    );
  };

  /* =========================================================
     GUARD
  ========================================================= */

  const renderGuard = () => (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
    >
      {renderTopBar(
        "Security Center",
        "Cyber Shield Guard"
      )}

      <View style={styles.guardHero}>
        <View style={styles.guardShield}>
          <Text style={styles.guardShieldText}>
            🛡️
          </Text>
        </View>

        <Text style={styles.guardTitle}>
          Your security layer is active
        </Text>

        <Text style={styles.guardDescription}>
          Cyber Shield helps identify suspicious
          messages, links and QR destinations
          before you interact with them.
        </Text>
      </View>

      <View style={styles.securityStatus}>
        <StatusItem
          icon="✓"
          title="Message Analysis"
          value="READY"
        />

        <StatusItem
          icon="✓"
          title="Link Scanner"
          value="READY"
        />

        <StatusItem
          icon="✓"
          title="QR Guard"
          value="READY"
        />

        <StatusItem
          icon="✓"
          title="IP Radar"
          value="READY"
        />
      </View>

      <View style={styles.historyPreview}>
        <View style={styles.historyHeader}>
          <Text style={styles.sectionTitle}>
            Scan History
          </Text>

          <Text style={styles.historyCount}>
            {history.length} scans
          </Text>
        </View>

        {history.length === 0 ? (
          <Text style={styles.emptyText}>
            Your analyzed messages will appear
            here.
          </Text>
        ) : (
          history.map((item, index) => (
            <Pressable
              key={index}
              style={styles.historyItem}
              onPress={() => {
                setAnalysis(item);
                setScreen("result");
              }}
            >
              <View
                style={[
                  styles.historyDot,
                  {
                    backgroundColor:
                      classificationColor(
                        item.classification
                      ),
                  },
                ]}
              />

              <View style={{ flex: 1 }}>
                <Text
                  style={styles.historyMessage}
                  numberOfLines={1}
                >
                  {item.message}
                </Text>

                <Text style={styles.historyTime}>
                  {item.timestamp}
                </Text>
              </View>

              <Text
                style={[
                  styles.historyScore,
                  {
                    color: riskColor(
                      item.score
                    ),
                  },
                ]}
              >
                {item.score}
              </Text>
            </Pressable>
          ))
        )}
      </View>

      <View style={styles.helpCard}>
        <Text style={styles.helpTitle}>
          Security Rules
        </Text>

        <Text style={styles.helpText}>
          • Never share OTPs or passwords.
        </Text>

        <Text style={styles.helpText}>
          • Verify unexpected payment requests.
        </Text>

        <Text style={styles.helpText}>
          • Do not trust urgent messages blindly.
        </Text>

        <Text style={styles.helpText}>
          • Check links before opening them.
        </Text>

        <Text style={styles.helpText}>
          • Contact organizations through official
          channels.
        </Text>
      </View>
    </ScrollView>
  );

  /* =========================================================
     DASHBOARD
  ========================================================= */

  const renderDashboard = () => {
    const total = history.length;
    const scams = history.filter((item) => item.classification === "SCAM").length;
    const suspicious = history.filter((item) => item.classification === "SUSPICIOUS").length;
    const safe = history.filter((item) => item.classification === "SAFE").length;
    const averageRisk = total
      ? Math.round(history.reduce((sum, item) => sum + item.score, 0) / total)
      : 0;

    return (
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {renderTopBar("Security Dashboard", "Cyber Shield Intelligence")}

        <View style={styles.dashboardHero}>
          <View style={styles.dashboardHeroGlow} />
          <View style={{ flex: 1 }}>
            <Text style={styles.dashboardEyebrow}>THREAT INTELLIGENCE</Text>
            <Text style={styles.dashboardTitle}>Your security overview</Text>
            <Text style={styles.dashboardDescription}>
              Monitor message analysis, threat activity and security tools from one place.
            </Text>
          </View>
          <Text style={styles.dashboardHeroIcon}>◈</Text>
        </View>

        <NeuralGrid />

        <View style={styles.dashboardStatsGrid}>
          <View style={styles.dashboardStatCard}>
            <Text style={styles.dashboardStatValue}>{total}</Text>
            <Text style={styles.dashboardStatLabel}>TOTAL SCANS</Text>
          </View>
          <View style={styles.dashboardStatCard}>
            <Text style={[styles.dashboardStatValue, { color: COLORS.red }]}>{scams}</Text>
            <Text style={styles.dashboardStatLabel}>SCAM ALERTS</Text>
          </View>
          <View style={styles.dashboardStatCard}>
            <Text style={[styles.dashboardStatValue, { color: COLORS.yellow }]}>{suspicious}</Text>
            <Text style={styles.dashboardStatLabel}>SUSPICIOUS</Text>
          </View>
          <View style={styles.dashboardStatCard}>
            <Text style={[styles.dashboardStatValue, { color: COLORS.green }]}>{safe}</Text>
            <Text style={styles.dashboardStatLabel}>SAFE</Text>
          </View>
        </View>

        <View style={styles.dashboardRiskCard}>
          <View style={styles.dashboardRiskHeader}>
            <View>
              <Text style={styles.cardTitle}>Average Risk Level</Text>
              <Text style={styles.cardDescription}>Based on analyzed messages</Text>
            </View>
            <Text style={[styles.dashboardRiskValue, { color: riskColor(averageRisk) }]}>
              {averageRisk}/100
            </Text>
          </View>
          <View style={styles.riskBarTrack}>
            <View
              style={[
                styles.riskBarFill,
                {
                  width: `${averageRisk}%`,
                  backgroundColor: riskColor(averageRisk),
                },
              ]}
            />
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Quick Access</Text>
        </View>

        <View style={styles.dashboardQuickGrid}>
          <Pressable style={styles.dashboardQuickCard} onPress={() => setScreen("liveSms")}>
            <Text style={styles.toolIcon}>📱</Text>
            <Text style={styles.toolTitle}>Live SMS</Text>
            <Text style={styles.toolDescription}>Monitor suspicious SMS</Text>
          </Pressable>
          <Pressable style={styles.dashboardQuickCard} onPress={() => setScreen("history")}>
            <Text style={styles.toolIcon}>🕘</Text>
            <Text style={styles.toolTitle}>History</Text>
            <Text style={styles.toolDescription}>View previous scans</Text>
          </Pressable>
          <Pressable style={styles.dashboardQuickCard} onPress={() => { setScreen("radar"); refreshRadar(); }}>
            <Text style={styles.toolIcon}>📡</Text>
            <Text style={styles.toolTitle}>IP Radar</Text>
            <Text style={styles.toolDescription}>Location intelligence</Text>
          </Pressable>
          <Pressable style={styles.dashboardQuickCard} onPress={() => setScreen("contact")}>
            <Text style={styles.toolIcon}>👤</Text>
            <Text style={styles.toolTitle}>Link Contact</Text>
            <Text style={styles.toolDescription}>Add trusted contact</Text>
          </Pressable>
        </View>

        <View style={styles.historyPreview}>
          <View style={styles.historyHeader}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            <Pressable onPress={() => setScreen("history")}>
              <Text style={styles.viewAll}>View History</Text>
            </Pressable>
          </View>

          {history.length === 0 ? (
            <Text style={styles.emptyText}>No activity yet. Analyze a message to populate the dashboard.</Text>
          ) : (
            history.slice(0, 4).map((item, index) => (
              <Pressable
                key={`${item.timestamp}-${index}`}
                style={styles.historyItem}
                onPress={() => { setAnalysis(item); setScreen("result"); }}
              >
                <View style={[styles.historyDot, { backgroundColor: classificationColor(item.classification) }]} />
                <View style={{ flex: 1 }}>
                  <Text numberOfLines={1} style={styles.historyMessage}>{item.message}</Text>
                  <Text style={styles.historyTime}>{item.timestamp}</Text>
                </View>
                <Text style={[styles.historyScore, { color: riskColor(item.score) }]}>{item.score}</Text>
              </Pressable>
            ))
          )}
        </View>
      </ScrollView>
    );
  };

  /* =========================================================
     LIVE SMS
  ========================================================= */

  const renderLiveSMS = () => {
    const demoMessages = [
      "URGENT! Your bank account will be blocked. Verify your OTP immediately.",
      "Congratulations! You won a prize. Click the link to claim your reward.",
      "Your delivery is ready. Please check the tracking information from the official app.",
    ];

    return (
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {renderTopBar("Live SMS", "SMS Threat Monitoring")}

        <View style={styles.liveSmsHero}>
          <View style={styles.liveSmsPulseOuter}>
            <View style={styles.liveSmsPulseInner}>
              <Text style={styles.liveSmsIcon}>✉</Text>
            </View>
          </View>
          <View style={{ flex: 1 }}>
            <View style={styles.liveSmsStatusRow}>
              <View style={styles.onlineDot} />
              <Text style={styles.liveSmsStatus}>MONITOR READY</Text>
            </View>
            <Text style={styles.liveSmsTitle}>Live SMS Threat Monitor</Text>
            <Text style={styles.liveSmsDescription}>
              Analyze suspicious SMS content immediately with the same Cyber Shield risk engine.
            </Text>
          </View>
        </View>

        <View style={styles.inputCard}>
          <Text style={styles.inputLabel}>INCOMING SMS</Text>
          <TextInput
            value={smsInput}
            onChangeText={setSmsInput}
            multiline
            placeholder="Paste or type an incoming SMS here..."
            placeholderTextColor="#536274"
            style={styles.messageInput}
            textAlignVertical="top"
          />
          <View style={styles.characterRow}>
            <Text style={styles.characterCount}>{smsInput.length} characters</Text>
            <Pressable onPress={() => setSmsInput(demoMessages[0])}>
              <Text style={styles.exampleText}>Load SMS Example</Text>
            </Pressable>
          </View>
        </View>

        <Pressable
          style={styles.primaryButton}
          onPress={() => {
            if (!smsInput.trim()) {
              Alert.alert("SMS Required", "Enter or paste an SMS message first.");
              return;
            }
            analyzeMessage(smsInput);
          }}
        >
          <Text style={styles.primaryButtonIcon}>◉</Text>
          <Text style={styles.primaryButtonText}>Analyze Live SMS</Text>
        </Pressable>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Recent SMS Stream</Text>
          {demoMessages.map((item, index) => (
            <Pressable
              key={index}
              style={styles.smsStreamItem}
              onPress={() => {
                setSmsInput(item);
                analyzeMessage(item);
              }}
            >
              <View style={styles.smsStreamDot} />
              <View style={{ flex: 1 }}>
                <Text style={styles.smsStreamText} numberOfLines={2}>{item}</Text>
                <Text style={styles.smsStreamMeta}>Tap to analyze</Text>
              </View>
              <Text style={styles.smsStreamArrow}>›</Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.noticeCard}>
          <Text style={styles.noticeIcon}>ℹ</Text>
          <Text style={styles.noticeText}>
            In Expo Go, this screen provides the SMS monitoring interface and manual analysis flow. Automatic background SMS reading requires platform-specific Android permissions and native integration in a production build.
          </Text>
        </View>
      </ScrollView>
    );
  };

  /* =========================================================
     HISTORY
  ========================================================= */

  const renderHistory = () => (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
    >
      {renderTopBar("Scan History", "Cyber Shield Activity")}

      <View style={styles.historySummaryCard}>
        <View>
          <Text style={styles.dashboardEyebrow}>LOCAL SECURITY ACTIVITY</Text>
          <Text style={styles.historySummaryTitle}>{history.length} saved scans</Text>
          <Text style={styles.cardDescription}>Your recent message-analysis reports are shown below.</Text>
        </View>
        {history.length > 0 && (
          <Pressable
            style={styles.smallDangerButton}
            onPress={() => {
              Alert.alert(
                "Clear History",
                "Remove all saved scan history from this session?",
                [
                  { text: "Cancel", style: "cancel" },
                  { text: "Clear", style: "destructive", onPress: () => setHistory([]) },
                ]
              );
            }}
          >
            <Text style={styles.smallDangerText}>Clear</Text>
          </Pressable>
        )}
      </View>

      {history.length === 0 ? (
        <View style={styles.emptyStateCard}>
          <Text style={styles.emptyStateIcon}>◌</Text>
          <Text style={styles.emptyStateTitle}>No scan history</Text>
          <Text style={styles.emptyStateDescription}>
            Analyze a suspicious message and the generated report will appear here.
          </Text>
          <Pressable style={styles.primaryButton} onPress={() => setScreen("analyze")}>
            <Text style={styles.primaryButtonIcon}>◉</Text>
            <Text style={styles.primaryButtonText}>Analyze a Message</Text>
          </Pressable>
        </View>
      ) : (
        <View style={styles.historyListCard}>
          {history.map((item, index) => (
            <Pressable
              key={`${item.timestamp}-${index}`}
              style={styles.historyItemLarge}
              onPress={() => { setAnalysis(item); setScreen("result"); }}
            >
              <View style={[styles.historyLargeBadge, { borderColor: classificationColor(item.classification) }]}>
                <Text style={[styles.historyLargeScore, { color: classificationColor(item.classification) }]}>{item.score}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <View style={styles.historyLargeTitleRow}>
                  <Text style={styles.historyLargeClassification}>{item.classification}</Text>
                  <Text style={styles.historyTime}>{item.timestamp}</Text>
                </View>
                <Text style={styles.historyLargeMessage} numberOfLines={2}>{item.message}</Text>
              </View>
              <Text style={styles.historyStreamArrow}>›</Text>
            </Pressable>
          ))}
        </View>
      )}
    </ScrollView>
  );

  /* =========================================================
     LINK CONTACT
  ========================================================= */

  const renderContact = () => (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
    >
      {renderTopBar("Link Contact", "Trusted Contact Protection")}

      <View style={styles.contactHero}>
        <View style={styles.contactIconCircle}>
          <Text style={styles.contactIcon}>👤</Text>
        </View>
        <Text style={styles.contactTitle}>Link a trusted contact</Text>
        <Text style={styles.contactDescription}>
          Keep a trusted person available as part of your personal security workflow.
        </Text>
      </View>

      <View style={styles.inputCard}>
        <Text style={styles.inputLabel}>CONTACT NAME</Text>
        <TextInput
          value={contactName}
          onChangeText={setContactName}
          placeholder="Enter contact name"
          placeholderTextColor="#536274"
          style={styles.singleLineInput}
        />

        <Text style={styles.inputLabel}>PHONE NUMBER</Text>
        <TextInput
          value={contactPhone}
          onChangeText={setContactPhone}
          placeholder="Enter phone number"
          placeholderTextColor="#536274"
          keyboardType="phone-pad"
          style={styles.singleLineInput}
        />

        <Text style={styles.inputLabel}>EMAIL ADDRESS</Text>
        <TextInput
          value={contactEmail}
          onChangeText={setContactEmail}
          placeholder="Enter email address"
          placeholderTextColor="#536274"
          keyboardType="email-address"
          autoCapitalize="none"
          style={styles.singleLineInput}
        />
      </View>

      <Pressable
        style={styles.primaryButton}
        onPress={() => {
          if (!contactName.trim() || (!contactPhone.trim() && !contactEmail.trim())) {
            Alert.alert("Contact Details Required", "Enter a name and at least a phone number or email address.");
            return;
          }
          setContactLinked(true);
          Alert.alert("Contact Linked", `${contactName.trim()} has been added as your trusted contact for this session.`);
        }}
      >
        <Text style={styles.primaryButtonIcon}>✓</Text>
        <Text style={styles.primaryButtonText}>Link Contact</Text>
      </Pressable>

      {contactLinked && (
        <View style={styles.linkedContactCard}>
          <View style={styles.linkedContactHeader}>
            <View style={styles.contactLinkedDot} />
            <Text style={styles.linkedContactTitle}>CONTACT LINKED</Text>
          </View>
          <InfoRow label="Name" value={contactName || "Unavailable"} />
          <InfoRow label="Phone" value={contactPhone || "Not provided"} />
          <InfoRow label="Email" value={contactEmail || "Not provided"} />
          <Pressable
            style={styles.secondaryButton}
            onPress={() => {
              setContactLinked(false);
              setContactName("");
              setContactPhone("");
              setContactEmail("");
            }}
          >
            <Text style={styles.secondaryButtonText}>Unlink Contact</Text>
          </Pressable>
        </View>
      )}

      <View style={styles.noticeCard}>
        <Text style={styles.noticeIcon}>🛡️</Text>
        <Text style={styles.noticeText}>
          Contact details entered here remain in the current app session unless you add a storage or backend service. This screen does not silently upload contact information.
        </Text>
      </View>
    </ScrollView>
  );

  /* =========================================================
     SECURITY GUIDE
  ========================================================= */

  const renderGuide = () => (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
    >
      {renderTopBar("Security Guide", "Cyber Shield Best Practices")}

      <View style={styles.guideHero}>
        <Text style={styles.guideHeroIcon}>🛡️</Text>
        <Text style={styles.guideHeroTitle}>Stay ahead of digital scams</Text>
        <Text style={styles.guideHeroText}>
          Use Cyber Shield as an early-warning layer and verify unexpected requests before taking action.
        </Text>
      </View>

      {[
        ["01", "Protect OTPs", "Never share OTPs, passwords, PINs or verification codes with someone who contacts you unexpectedly."],
        ["02", "Check urgency", "Scammers often create pressure by claiming that an account, payment or reward needs immediate action."],
        ["03", "Inspect links", "Do not enter credentials or payment information on links you cannot independently verify."],
        ["04", "Verify identity", "Contact banks, companies and organizations through official apps, websites or published contact channels."],
        ["05", "Think before paying", "Be careful with prize fees, investment deposits, job registration fees and unexpected payment requests."],
      ].map(([number, title, text]) => (
        <View style={styles.guideItem} key={number}>
          <View style={styles.guideNumber}><Text style={styles.guideNumberText}>{number}</Text></View>
          <View style={{ flex: 1 }}>
            <Text style={styles.guideItemTitle}>{title}</Text>
            <Text style={styles.guideItemText}>{text}</Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );

  /* =========================================================
     MORE MENU
  ========================================================= */

  const renderMore = () => {
    const menu = [
      { key: "dashboard" as Screen, icon: "📊", title: "Dashboard", text: "Security overview and live intelligence" },
      { key: "liveSms" as Screen, icon: "📱", title: "Live SMS", text: "Monitor and analyze SMS threats" },
      { key: "history" as Screen, icon: "🕘", title: "History", text: "Review previous security reports" },
      { key: "radar" as Screen, icon: "📡", title: "IP Radar", text: "Device location and public IP" },
      { key: "contact" as Screen, icon: "👤", title: "Link Contact", text: "Add a trusted security contact" },
      { key: "qr" as Screen, icon: "📷", title: "QR Guard", text: "Scan QR destinations safely" },
      { key: "guide" as Screen, icon: "📖", title: "Security Guide", text: "Cyber safety rules and tips" },
    ];

    return (
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {renderTopBar("More Security Tools", "Cyber Shield Control Center")}

        <View style={styles.moreHero}>
          <Text style={styles.moreHeroIcon}>◈</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.moreHeroTitle}>All security modules</Text>
            <Text style={styles.moreHeroText}>Access the complete Cyber Shield mobile toolkit.</Text>
          </View>
        </View>

        <View style={styles.moreGrid}>
          {menu.map((item) => (
            <Pressable
              key={item.key}
              style={styles.moreCard}
              onPress={() => {
                if (item.key === "radar") {
                  setScreen("radar");
                  refreshRadar();
                } else if (item.key === "qr") {
                  openQRScanner();
                } else {
                  setScreen(item.key);
                }
              }}
            >
              <Text style={styles.moreCardIcon}>{item.icon}</Text>
              <Text style={styles.moreCardTitle}>{item.title}</Text>
              <Text style={styles.moreCardText}>{item.text}</Text>
              <Text style={styles.moreCardArrow}>›</Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    );
  };

  /* =========================================================
     QR CAMERA
  ========================================================= */

  const renderQR = () => (
    <View style={styles.qrScreen}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="#000000"
      />

      <View style={styles.qrHeader}>
        <Pressable
          style={styles.qrBack}
          onPress={() => setScreen("home")}
        >
          <Text style={styles.qrBackText}>
            ‹
          </Text>
        </Pressable>

        <View>
          <Text style={styles.qrTitle}>
            QR Guard
          </Text>

          <Text style={styles.qrSubtitle}>
            Scan before you open
          </Text>
        </View>
      </View>

      <View style={styles.cameraWrapper}>
        <CameraView
          style={styles.camera}
          facing="back"
          barcodeScannerSettings={{
            barcodeTypes: [
              "qr",
              "ean13",
              "ean8",
              "code128",
              "code39",
              "upc_a",
              "upc_e",
            ],
          }}
          onBarcodeScanned={
            handleBarcodeScanned
          }
        />

        <View style={styles.scannerOverlay}>
          <View
            style={[
              styles.corner,
              styles.cornerTopLeft,
            ]}
          />
          <View
            style={[
              styles.corner,
              styles.cornerTopRight,
            ]}
          />
          <View
            style={[
              styles.corner,
              styles.cornerBottomLeft,
            ]}
          />
          <View
            style={[
              styles.corner,
              styles.cornerBottomRight,
            ]}
          />

          <View style={styles.scanLine} />
        </View>
      </View>

      <View style={styles.qrBottom}>
        <Text style={styles.qrInstruction}>
          Place the QR code inside the frame.
        </Text>

        <Text style={styles.qrWarning}>
          Cyber Shield will analyze the destination
          before you continue.
        </Text>
      </View>
    </View>
  );

  /* =========================================================
     BOTTOM NAVIGATION
  ========================================================= */

  const renderBottomNav = () => {
    if (screen === "qr") {
      return null;
    }

    const items: {
      key: Screen;
      icon: string;
      label: string;
    }[] = [
      { key: "home", icon: "⌂", label: "Home" },
      { key: "guard", icon: "🛡", label: "Guard" },
      { key: "analyze", icon: "◉", label: "Analyze" },
      { key: "links", icon: "🔗", label: "Links" },
      { key: "more", icon: "☷", label: "More" },
    ];

    const moreScreens: Screen[] = [
      "dashboard",
      "liveSms",
      "history",
      "radar",
      "contact",
      "guide",
    ];

    return (
      <View style={styles.bottomNav}>
        {items.map((item) => {
          const active =
            screen === item.key ||
            (screen === "result" && item.key === "analyze") ||
            (moreScreens.includes(screen) && item.key === "more");

          return (
            <Pressable
              key={item.key}
              style={styles.navItem}
              onPress={() => setScreen(item.key)}
            >
              <View
                style={[
                  styles.navIconContainer,
                  active && styles.navIconActive,
                ]}
              >
                <Text
                  style={[
                    styles.navIcon,
                    active && styles.navIconSelected,
                  ]}
                >
                  {item.icon}
                </Text>
              </View>

              <Text
                style={[
                  styles.navLabel,
                  active && styles.navLabelSelected,
                ]}
              >
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    );
  };

  /* =========================================================
     SCREEN ROUTER
  ========================================================= */

  const renderScreen = () => {
    switch (screen) {
      case "home":
        return renderHome();

      case "dashboard":
        return renderDashboard();

      case "guard":
        return renderGuard();

      case "liveSms":
        return renderLiveSMS();

      case "analyze":
        return renderAnalyzer();

      case "result":
        return renderResult();

      case "links":
        return renderLinks();

      case "radar":
        return renderRadar();

      case "history":
        return renderHistory();

      case "contact":
        return renderContact();

      case "guide":
        return renderGuide();

      case "more":
        return renderMore();

      case "qr":
        return renderQR();

      default:
        return renderHome();
    }
  };

  return (
    <>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar
          barStyle="light-content"
          backgroundColor={COLORS.bg}
        />

        <View style={styles.container}>
          {renderScreen()}
          {renderBottomNav()}
        </View>
      </SafeAreaView>

      <Modal
        visible={reportVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setReportVisible(false)}
      >
        <View style={styles.reportModalBackdrop}>
          <View style={styles.reportModalCard}>
            <View style={styles.reportModalHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.reportModalTitle}>Security Report</Text>
                <Text style={styles.reportModalSubtitle}>Cyber Shield generated report</Text>
              </View>
              <Pressable
                style={styles.reportCloseButton}
                onPress={() => setReportVisible(false)}
              >
                <Text style={styles.reportCloseText}>×</Text>
              </Pressable>
            </View>

            <ScrollView
              style={styles.reportPreview}
              contentContainerStyle={styles.reportPreviewContent}
              showsVerticalScrollIndicator={false}
            >
              <Text style={styles.reportPreviewText}>{reportText}</Text>
            </ScrollView>

            <Pressable style={styles.primaryButton} onPress={shareReport}>
              <Text style={styles.primaryButtonIcon}>↗</Text>
              <Text style={styles.primaryButtonText}>Share Report</Text>
            </Pressable>

            <Pressable
              style={styles.secondaryButton}
              onPress={() => setReportVisible(false)}
            >
              <Text style={styles.secondaryButtonText}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </>
  );
}

/* =========================================================
   SMALL COMPONENTS
========================================================= */

function NeuralLine({
  style,
  color,
}: {
  style: any;
  color: string;
}) {
  return (
    <View
      pointerEvents="none"
      style={[
        styles.neuralLine,
        style,
        {
          backgroundColor: color,
          shadowColor: color,
        },
      ]}
    />
  );
}

function NeuralNode({
  style,
  color,
  pulse,
}: {
  style: any;
  color: string;
  pulse: Animated.Value;
}) {
  const scale = pulse.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.86, 1.18, 0.98],
  });

  const opacity = pulse.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.55, 1, 0.72],
  });

  return (
    <Animated.View
      style={[
        styles.neuralNodeGlow,
        style,
        {
          opacity,
          transform: [{ scale }],
        },
      ]}
    >
      <View
        style={[
          styles.neuralNode,
          {
            backgroundColor: color,
            shadowColor: color,
          },
        ]}
      />
    </Animated.View>
  );
}

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>
        {label}
      </Text>

      <Text style={styles.infoValue}>
        {value}
      </Text>
    </View>
  );
}

function StatusItem({
  icon,
  title,
  value,
}: {
  icon: string;
  title: string;
  value: string;
}) {
  return (
    <View style={styles.statusItem}>
      <View style={styles.statusIcon}>
        <Text style={styles.statusIconText}>
          {icon}
        </Text>
      </View>

      <View style={{ flex: 1 }}>
        <Text style={styles.statusTitle}>
          {title}
        </Text>

        <Text style={styles.statusValue}>
          {value}
        </Text>
      </View>
    </View>
  );
}

/* =========================================================
   STYLES
========================================================= */

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },

  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },

  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 110,
  },

  /* TOP BAR */

  topBar: {
    minHeight: 64,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 18,
  },

  topBarLeft: {
    flexDirection: "row",
    alignItems: "center",
  },

  backButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  backText: {
    color: COLORS.white,
    fontSize: 32,
    lineHeight: 34,
  },

  appTitle: {
    color: COLORS.white,
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: 0.4,
  },

  appSubtitle: {
    color: COLORS.muted,
    fontSize: 11,
    marginTop: 2,
  },

  aiBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#174B55",
    backgroundColor: "#071A1F",
  },

  onlineDot: {
    width: 7,
    height: 7,
    borderRadius: 10,
    backgroundColor: COLORS.green,
    marginRight: 6,
  },

  aiText: {
    color: COLORS.green,
    fontSize: 9,
    fontWeight: "800",
  },

  /* NEURAL GRID */

  neuralCard: {
    borderRadius: 20,
    padding: 14,
    marginBottom: 14,
    backgroundColor: "#071019",
    borderWidth: 1,
    borderColor: "#1B3042",
    overflow: "hidden",
  },

  neuralHeader: {
    minHeight: 42,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },

  neuralEyebrow: {
    color: "#83B7D8",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.2,
  },

  neuralSubtitle: {
    color: "#536B7E",
    fontSize: 9,
    marginTop: 4,
  },

  liveBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 18,
    backgroundColor: "#06211D",
    borderWidth: 1,
    borderColor: "#075D4C",
  },

  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 7,
    backgroundColor: COLORS.green,
    marginRight: 6,
  },

  liveText: {
    color: COLORS.green,
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 0.8,
  },

  neuralViewport: {
    height: 238,
    borderRadius: 15,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#20384B",
    backgroundColor: "#040C14",
    position: "relative",
  },

  neuralGridBase: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "#06121B",
    opacity: 0.55,
  },

  neuralGridVertical: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: "#0B202D",
  },

  neuralGridHorizontal: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: "#0B202D",
  },

  neuralScanBeam: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: COLORS.cyan,
    shadowColor: COLORS.cyan,
    shadowOpacity: 0.9,
    shadowRadius: 14,
    elevation: 5,
  },

  neuralLine: {
    position: "absolute",
    height: 1,
    opacity: 0.7,
    shadowOpacity: 0.7,
    shadowRadius: 8,
    elevation: 3,
  },

  neuralLineOne: {
    width: 230,
    left: 58,
    top: 58,
    transform: [{ rotate: "25deg" }],
  },

  neuralLineTwo: {
    width: 210,
    left: 175,
    top: 140,
    transform: [{ rotate: "-12deg" }],
  },

  neuralLineThree: {
    width: 180,
    left: 275,
    top: 65,
    transform: [{ rotate: "18deg" }],
  },

  neuralLineFour: {
    width: 165,
    left: 240,
    top: 174,
    transform: [{ rotate: "-20deg" }],
  },

  neuralLineFive: {
    width: 150,
    left: 335,
    top: 95,
    transform: [{ rotate: "12deg" }],
  },

  neuralNodeGlow: {
    position: "absolute",
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },

  neuralNode: {
    width: 11,
    height: 11,
    borderRadius: 10,
    shadowOpacity: 0.95,
    shadowRadius: 12,
    elevation: 8,
  },

  neuralNodeOne: {
    left: 88,
    top: 28,
  },

  neuralNodeTwo: {
    left: 345,
    top: 50,
  },

  neuralNodeThree: {
    left: 170,
    top: 106,
  },

  neuralNodeFour: {
    left: 400,
    top: 154,
  },

  neuralNodeFive: {
    left: 525,
    top: 82,
  },

  neuralNodeSix: {
    left: 270,
    top: 50,
  },

  neuralCore: {
    position: "absolute",
    left: "48%",
    top: "42%",
    width: 44,
    height: 44,
    marginLeft: -22,
    marginTop: -22,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#071A25",
    borderWidth: 1,
    borderColor: COLORS.cyan,
    shadowColor: COLORS.cyan,
    shadowOpacity: 0.8,
    shadowRadius: 18,
    elevation: 9,
  },

  neuralCoreIcon: {
    color: COLORS.cyan,
    fontSize: 21,
    fontWeight: "900",
  },

  neuralStatusRow: {
    position: "absolute",
    bottom: 9,
    left: 12,
    right: 12,
    alignItems: "center",
  },

  neuralStatusText: {
    color: "#456176",
    fontSize: 8,
    fontWeight: "800",
    letterSpacing: 1.1,
  },

  /* HERO */

  heroCard: {
    minHeight: 315,
    borderRadius: 26,
    padding: 20,
    overflow: "hidden",
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: "row",
    marginBottom: 14,
  },

  heroText: {
    width: "57%",
    zIndex: 2,
  },

  heroSmall: {
    color: COLORS.cyan,
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1.4,
    marginBottom: 12,
  },

  heroTitle: {
    color: COLORS.white,
    fontSize: 29,
    lineHeight: 34,
    fontWeight: "900",
  },

  heroDescription: {
    color: COLORS.muted,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 14,
  },

  graphicContainer: {
    position: "absolute",
    right: -25,
    top: 20,
    width: 220,
    height: 260,
    alignItems: "center",
    justifyContent: "center",
  },

  glowCircle: {
    position: "absolute",
    width: 175,
    height: 175,
    borderRadius: 100,
    backgroundColor: COLORS.cyan,
  },

  ring: {
    position: "absolute",
    borderRadius: 200,
    borderWidth: 1,
    borderColor: "#164B58",
  },

  ringOne: {
    width: 210,
    height: 210,
  },

  ringTwo: {
    width: 165,
    height: 165,
  },

  ringThree: {
    width: 115,
    height: 115,
  },

  shieldGraphic: {
    width: 90,
    height: 105,
    borderRadius: 30,
    backgroundColor: "#0A1C27",
    borderWidth: 2,
    borderColor: COLORS.cyan,
    alignItems: "center",
    justifyContent: "center",
    transform: [{ rotate: "45deg" }],
  },

  shieldIcon: {
    fontSize: 48,
    transform: [{ rotate: "-45deg" }],
  },

  graphicNode: {
    position: "absolute",
    width: 8,
    height: 8,
    borderRadius: 10,
    backgroundColor: COLORS.cyan,
  },

  nodeOne: {
    top: 15,
    right: 75,
  },

  nodeTwo: {
    bottom: 30,
    right: 25,
  },

  nodeThree: {
    left: 15,
    top: 95,
  },

  nodeFour: {
    left: 55,
    bottom: 5,
  },

  /* STATS */

  statsRow: {
    flexDirection: "row",
    gap: 9,
    marginBottom: 22,
  },

  statCard: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: "center",
  },

  statNumber: {
    color: COLORS.cyan,
    fontSize: 17,
    fontWeight: "900",
  },

  statLabel: {
    color: COLORS.muted,
    fontSize: 10,
    marginTop: 3,
  },

  /* SECTIONS */

  sectionHeader: {
    marginBottom: 10,
  },

  sectionTitle: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "800",
  },

  /* TOOLS */

  toolGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 22,
  },

  toolCard: {
    width: (width - 46) / 2,
    minHeight: 135,
    borderRadius: 19,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
  },

  toolIcon: {
    fontSize: 28,
    marginBottom: 11,
  },

  toolTitle: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: "800",
  },

  toolDescription: {
    color: COLORS.muted,
    fontSize: 10,
    marginTop: 5,
  },

  /* HISTORY */

  historyPreview: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
  },

  historyHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },

  viewAll: {
    color: COLORS.cyan,
    fontSize: 10,
    fontWeight: "700",
  },

  historyCount: {
    color: COLORS.cyan,
    fontSize: 10,
  },

  historyItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 11,
    borderTopWidth: 1,
    borderTopColor: "#17202D",
    gap: 10,
  },

  historyDot: {
    width: 9,
    height: 9,
    borderRadius: 10,
  },

  historyMessage: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: "600",
  },

  historyTime: {
    color: COLORS.muted,
    fontSize: 9,
    marginTop: 3,
  },

  historyScore: {
    fontSize: 15,
    fontWeight: "900",
  },

  emptyText: {
    color: COLORS.muted,
    fontSize: 11,
    lineHeight: 18,
  },

  /* ANALYZER */

  analyzerIntro: {
    flexDirection: "row",
    backgroundColor: COLORS.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
    gap: 12,
    marginBottom: 14,
  },

  analyzerIcon: {
    fontSize: 32,
  },

  cardTitle: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: "800",
  },

  cardDescription: {
    color: COLORS.muted,
    fontSize: 10,
    lineHeight: 16,
    marginTop: 5,
  },

  inputCard: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
    marginBottom: 12,
  },

  inputLabel: {
    color: COLORS.cyan,
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1,
    marginBottom: 10,
  },

  messageInput: {
    minHeight: 180,
    color: COLORS.white,
    backgroundColor: "#070B11",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
    fontSize: 13,
    lineHeight: 20,
  },

  characterRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },

  characterCount: {
    color: COLORS.muted,
    fontSize: 9,
  },

  exampleText: {
    color: COLORS.cyan,
    fontSize: 9,
    fontWeight: "800",
  },

  primaryButton: {
    height: 54,
    borderRadius: 16,
    backgroundColor: COLORS.cyan,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 9,
    marginBottom: 12,
  },

  primaryButtonIcon: {
    color: COLORS.darkText,
    fontSize: 18,
    fontWeight: "900",
  },

  primaryButtonText: {
    color: COLORS.darkText,
    fontSize: 13,
    fontWeight: "900",
  },

  secondaryButton: {
    height: 52,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.card,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },

  secondaryButtonText: {
    color: COLORS.cyan,
    fontSize: 12,
    fontWeight: "800",
  },

  infoCard: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 20,
    padding: 16,
  },

  infoTitle: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: "800",
    marginBottom: 8,
  },

  checkRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    marginTop: 9,
  },

  checkIcon: {
    color: COLORS.green,
    fontWeight: "900",
    fontSize: 13,
  },

  warningIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#3A201A",
    color: COLORS.yellow,
    textAlign: "center",
    lineHeight: 20,
    fontWeight: "900",
  },

  checkText: {
    flex: 1,
    color: COLORS.muted,
    fontSize: 11,
  },

  /* RESULT */

  resultHero: {
    backgroundColor: COLORS.card,
    borderRadius: 24,
    borderWidth: 1,
    padding: 24,
    alignItems: "center",
    marginBottom: 14,
  },

  resultStatusCircle: {
    width: 145,
    height: 145,
    borderRadius: 100,
    borderWidth: 3,
    alignItems: "center",
    justifyContent: "center",
  },

  resultScore: {
    fontSize: 48,
    fontWeight: "900",
  },

  scoreSmall: {
    color: COLORS.muted,
    fontSize: 12,
    marginTop: -7,
  },

  classification: {
    fontSize: 20,
    fontWeight: "900",
    letterSpacing: 1,
    marginTop: 15,
  },

  resultSummary: {
    color: COLORS.muted,
    textAlign: "center",
    fontSize: 11,
    lineHeight: 18,
    marginTop: 8,
  },

  reportSection: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
  },

  reportSectionTitle: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: "800",
    marginBottom: 12,
  },

  indicatorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 10,
  },

  indicatorNumber: {
    width: 25,
    height: 25,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },

  indicatorNumberText: {
    color: COLORS.darkText,
    fontSize: 10,
    fontWeight: "900",
  },

  indicatorText: {
    flex: 1,
    color: COLORS.muted,
    fontSize: 11,
    lineHeight: 17,
  },

  recommendationBox: {
    flexDirection: "row",
    gap: 10,
    backgroundColor: "#08191D",
    borderWidth: 1,
    borderColor: "#154B51",
    borderRadius: 14,
    padding: 13,
  },

  recommendationIcon: {
    fontSize: 22,
  },

  recommendationText: {
    flex: 1,
    color: COLORS.muted,
    fontSize: 11,
    lineHeight: 18,
  },

  contentBox: {
    backgroundColor: "#070B11",
    borderRadius: 13,
    padding: 13,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  contentText: {
    color: "#AAB5C4",
    fontSize: 11,
    lineHeight: 18,
  },

  /* LINKS */

  largeToolGraphic: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 24,
    padding: 25,
    alignItems: "center",
    marginBottom: 14,
  },

  largeToolIcon: {
    fontSize: 50,
    marginBottom: 10,
  },

  largeToolTitle: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: "900",
  },

  largeToolDescription: {
    color: COLORS.muted,
    fontSize: 11,
    lineHeight: 18,
    textAlign: "center",
    marginTop: 8,
  },

  urlInput: {
    height: 55,
    backgroundColor: "#070B11",
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    color: COLORS.white,
    paddingHorizontal: 14,
    fontSize: 12,
  },

  linkResult: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 20,
    padding: 16,
    marginTop: 5,
  },

  linkResultTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  resultBadge: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 9,
    paddingVertical: 5,
    fontSize: 9,
    fontWeight: "900",
  },

  linkScore: {
    color: COLORS.muted,
    fontSize: 11,
    marginTop: 12,
    marginBottom: 5,
  },

  smallButton: {
    marginTop: 15,
    height: 44,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: COLORS.cyan,
    alignItems: "center",
    justifyContent: "center",
  },

  smallButtonText: {
    color: COLORS.cyan,
    fontSize: 11,
    fontWeight: "800",
  },

  /* RADAR */

  radarCard: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 24,
    padding: 20,
    alignItems: "center",
    marginBottom: 12,
  },

  radarVisual: {
    width: 260,
    height: 260,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },

  radarCircleLarge: {
    position: "absolute",
    width: 250,
    height: 250,
    borderRadius: 150,
    borderWidth: 1,
    borderColor: "#17434E",
  },

  radarCircleMedium: {
    position: "absolute",
    width: 175,
    height: 175,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: "#17434E",
  },

  radarCircleSmall: {
    position: "absolute",
    width: 95,
    height: 95,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: "#17434E",
  },

  radarSweep: {
    position: "absolute",
    width: 120,
    height: 2,
    backgroundColor: COLORS.cyan,
    left: 130,
    top: 129,
    transformOrigin: "left center",
    opacity: 0.8,
  },

  radarCenter: {
    width: 54,
    height: 54,
    borderRadius: 30,
    backgroundColor: "#09202A",
    borderWidth: 1,
    borderColor: COLORS.cyan,
    alignItems: "center",
    justifyContent: "center",
  },

  radarCenterIcon: {
    fontSize: 22,
  },

  radarPoint: {
    position: "absolute",
    width: 12,
    height: 12,
    borderRadius: 20,
    backgroundColor: COLORS.red,
    top: 75,
    right: 65,
    shadowColor: COLORS.red,
    shadowOpacity: 1,
    shadowRadius: 12,
  },

  radarTitle: {
    color: COLORS.white,
    fontSize: 17,
    fontWeight: "900",
    marginTop: 5,
  },

  radarDescription: {
    color: COLORS.muted,
    fontSize: 10,
    textAlign: "center",
    lineHeight: 17,
    marginTop: 5,
  },

  locationCard: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
  },

  locationHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },

  radarLiveBadge: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#174B55",
    borderRadius: 10,
    paddingHorizontal: 7,
    paddingVertical: 4,
  },

  radarLiveText: {
    color: COLORS.green,
    fontSize: 8,
    fontWeight: "900",
  },

  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "#17202D",
    paddingVertical: 10,
  },

  infoLabel: {
    color: COLORS.muted,
    fontSize: 10,
  },

  infoValue: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: "700",
    maxWidth: "60%",
    textAlign: "right",
  },

  noticeCard: {
    flexDirection: "row",
    gap: 10,
    backgroundColor: "#0A111A",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
  },

  noticeIcon: {
    color: COLORS.cyan,
    fontSize: 18,
    fontWeight: "900",
  },

  noticeText: {
    flex: 1,
    color: COLORS.muted,
    fontSize: 10,
    lineHeight: 16,
  },

  /* GUARD */

  guardHero: {
    backgroundColor: COLORS.card,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 25,
    alignItems: "center",
    marginBottom: 12,
  },

  guardShield: {
    width: 100,
    height: 100,
    borderRadius: 30,
    backgroundColor: "#08232B",
    borderWidth: 2,
    borderColor: COLORS.cyan,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 15,
  },

  guardShieldText: {
    fontSize: 45,
  },

  guardTitle: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: "900",
    textAlign: "center",
  },

  guardDescription: {
    color: COLORS.muted,
    fontSize: 11,
    lineHeight: 18,
    textAlign: "center",
    marginTop: 8,
  },

  securityStatus: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 20,
    padding: 14,
    marginBottom: 12,
  },

  statusItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#17202D",
  },

  statusIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: "#08271E",
    alignItems: "center",
    justifyContent: "center",
  },

  statusIconText: {
    color: COLORS.green,
    fontWeight: "900",
  },

  statusTitle: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: "700",
  },

  statusValue: {
    color: COLORS.green,
    fontSize: 8,
    fontWeight: "900",
    marginTop: 2,
  },

  helpCard: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 20,
    padding: 16,
  },

  helpTitle: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: "800",
    marginBottom: 8,
  },

  helpText: {
    color: COLORS.muted,
    fontSize: 11,
    lineHeight: 21,
  },

  /* REPORT MODAL */

  reportModalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.82)",
    justifyContent: "flex-end",
  },

  reportModalCard: {
    maxHeight: "88%",
    backgroundColor: COLORS.card,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 18,
    paddingBottom: Platform.OS === "ios" ? 28 : 18,
  },

  reportModalHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },

  reportModalTitle: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: "900",
  },

  reportModalSubtitle: {
    color: COLORS.muted,
    fontSize: 10,
    marginTop: 3,
  },

  reportCloseButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: COLORS.card2,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
  },

  reportCloseText: {
    color: COLORS.white,
    fontSize: 25,
    lineHeight: 28,
  },

  reportPreview: {
    maxHeight: 420,
    backgroundColor: "#070B11",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 14,
  },

  reportPreviewContent: {
    padding: 14,
  },

  reportPreviewText: {
    color: COLORS.white,
    fontSize: 11,
    lineHeight: 18,
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
  },

  /* QR */

  qrScreen: {
    flex: 1,
    backgroundColor: "#000000",
  },

  qrHeader: {
    height: 85,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    gap: 12,
  },

  qrBack: {
    width: 40,
    height: 40,
    borderRadius: 13,
    backgroundColor: "#11151C",
    alignItems: "center",
    justifyContent: "center",
  },

  qrBackText: {
    color: COLORS.white,
    fontSize: 32,
    lineHeight: 34,
  },

  qrTitle: {
    color: COLORS.white,
    fontSize: 19,
    fontWeight: "900",
  },

  qrSubtitle: {
    color: COLORS.muted,
    fontSize: 10,
    marginTop: 2,
  },

  cameraWrapper: {
    flex: 1,
    marginHorizontal: 18,
    borderRadius: 25,
    overflow: "hidden",
    position: "relative",
  },

  camera: {
    flex: 1,
  },

  scannerOverlay: {
    ...StyleSheet.absoluteFill,
    alignItems: "center",
    justifyContent: "center",
  },

  corner: {
    position: "absolute",
    width: 48,
    height: 48,
    borderColor: COLORS.cyan,
  },

  cornerTopLeft: {
    top: "28%",
    left: "12%",
    borderTopWidth: 3,
    borderLeftWidth: 3,
  },

  cornerTopRight: {
    top: "28%",
    right: "12%",
    borderTopWidth: 3,
    borderRightWidth: 3,
  },

  cornerBottomLeft: {
    bottom: "28%",
    left: "12%",
    borderBottomWidth: 3,
    borderLeftWidth: 3,
  },

  cornerBottomRight: {
    bottom: "28%",
    right: "12%",
    borderBottomWidth: 3,
    borderRightWidth: 3,
  },

  scanLine: {
    width: "72%",
    height: 2,
    backgroundColor: COLORS.cyan,
    opacity: 0.8,
  },

  qrBottom: {
    padding: 25,
    alignItems: "center",
  },

  qrInstruction: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: "700",
  },

  qrWarning: {
    color: COLORS.muted,
    fontSize: 10,
    textAlign: "center",
    marginTop: 7,
  },

  /* ADDITIONAL SECURITY MODULES */

  dashboardHero: {
    minHeight: 150,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#17384A",
    backgroundColor: "#08141D",
    padding: 20,
    marginBottom: 16,
    overflow: "hidden",
    flexDirection: "row",
    alignItems: "center",
    position: "relative",
  },

  dashboardHeroGlow: {
    position: "absolute",
    width: 180,
    height: 180,
    borderRadius: 90,
    right: -70,
    top: -80,
    backgroundColor: "#003E4B",
    opacity: 0.38,
  },

  dashboardEyebrow: {
    color: COLORS.cyan,
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1.2,
    marginBottom: 7,
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
  },

  dashboardTitle: {
    color: COLORS.white,
    fontSize: 22,
    fontWeight: "900",
  },

  dashboardDescription: {
    color: COLORS.muted,
    fontSize: 11,
    lineHeight: 17,
    marginTop: 7,
    maxWidth: 260,
  },

  dashboardHeroIcon: {
    color: COLORS.cyan,
    fontSize: 45,
    marginLeft: 10,
    textShadowColor: COLORS.cyan,
    textShadowRadius: 18,
  },

  dashboardStatsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 15,
  },

  dashboardStatCard: {
    width: "48.5%",
    minHeight: 92,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.card,
    padding: 15,
    marginBottom: 10,
  },

  dashboardStatValue: {
    color: COLORS.cyan,
    fontSize: 27,
    fontWeight: "900",
  },

  dashboardStatLabel: {
    color: COLORS.muted,
    fontSize: 8,
    fontWeight: "800",
    letterSpacing: 0.8,
    marginTop: 5,
  },

  dashboardRiskCard: {
    backgroundColor: COLORS.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
    marginBottom: 17,
  },

  dashboardRiskHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  dashboardRiskValue: {
    fontSize: 20,
    fontWeight: "900",
  },

  riskBarTrack: {
    height: 7,
    borderRadius: 5,
    backgroundColor: "#18222E",
    overflow: "hidden",
    marginTop: 13,
  },

  riskBarFill: {
    height: "100%",
    borderRadius: 5,
  },

  dashboardQuickGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 16,
  },

  dashboardQuickCard: {
    width: "48.5%",
    minHeight: 128,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 18,
    padding: 14,
    marginBottom: 10,
  },

  liveSmsHero: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#07151A",
    borderWidth: 1,
    borderColor: "#12434A",
    borderRadius: 20,
    padding: 18,
    marginBottom: 15,
  },

  liveSmsPulseOuter: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: "#07313A",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },

  liveSmsPulseInner: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#0A4B55",
    alignItems: "center",
    justifyContent: "center",
  },

  liveSmsIcon: {
    color: COLORS.cyan,
    fontSize: 22,
  },

  liveSmsStatusRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },

  liveSmsStatus: {
    color: COLORS.green,
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 0.9,
    marginLeft: 6,
  },

  liveSmsTitle: {
    color: COLORS.white,
    fontSize: 17,
    fontWeight: "900",
  },

  liveSmsDescription: {
    color: COLORS.muted,
    fontSize: 10,
    lineHeight: 15,
    marginTop: 5,
  },

  smsStreamItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },

  smsStreamDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.cyan,
    marginRight: 11,
    shadowColor: COLORS.cyan,
    shadowRadius: 8,
  },

  smsStreamText: {
    color: COLORS.white,
    fontSize: 11,
    lineHeight: 16,
  },

  smsStreamMeta: {
    color: COLORS.cyan,
    fontSize: 8,
    marginTop: 4,
    fontWeight: "700",
  },

  smsStreamArrow: {
    color: COLORS.cyan,
    fontSize: 24,
    marginLeft: 8,
  },

  historySummaryCard: {
    backgroundColor: COLORS.card,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 17,
    marginBottom: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  historySummaryTitle: {
    color: COLORS.white,
    fontSize: 21,
    fontWeight: "900",
    marginBottom: 4,
  },

  smallDangerButton: {
    paddingHorizontal: 13,
    paddingVertical: 9,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#5C2333",
    backgroundColor: "#211019",
  },

  smallDangerText: {
    color: COLORS.red,
    fontSize: 10,
    fontWeight: "900",
  },

  emptyStateCard: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 25,
    alignItems: "center",
  },

  emptyStateIcon: {
    color: COLORS.cyan,
    fontSize: 45,
    marginBottom: 10,
  },

  emptyStateTitle: {
    color: COLORS.white,
    fontSize: 19,
    fontWeight: "900",
  },

  emptyStateDescription: {
    color: COLORS.muted,
    fontSize: 11,
    lineHeight: 17,
    textAlign: "center",
    marginTop: 7,
    marginBottom: 15,
  },

  historyListCard: {
    backgroundColor: COLORS.card,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 14,
  },

  historyItemLarge: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },

  historyLargeBadge: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  historyLargeScore: {
    fontSize: 16,
    fontWeight: "900",
  },

  historyLargeTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },

  historyLargeClassification: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: "900",
  },

  historyLargeMessage: {
    color: COLORS.muted,
    fontSize: 10,
    lineHeight: 15,
    paddingRight: 6,
  },

  historyStreamArrow: {
    color: COLORS.cyan,
    fontSize: 23,
  },

  contactHero: {
    alignItems: "center",
    backgroundColor: "#08151A",
    borderRadius: 21,
    borderWidth: 1,
    borderColor: "#16404A",
    padding: 24,
    marginBottom: 15,
  },

  contactIconCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#0A3039",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },

  contactIcon: {
    fontSize: 30,
  },

  contactTitle: {
    color: COLORS.white,
    fontSize: 21,
    fontWeight: "900",
  },

  contactDescription: {
    color: COLORS.muted,
    fontSize: 11,
    lineHeight: 17,
    textAlign: "center",
    marginTop: 7,
  },

  singleLineInput: {
    minHeight: 47,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: "#080D14",
    color: COLORS.white,
    paddingHorizontal: 13,
    marginTop: 6,
    marginBottom: 15,
    fontSize: 12,
  },

  linkedContactCard: {
    backgroundColor: COLORS.card,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: "#0E5D4B",
    padding: 16,
    marginTop: 14,
  },

  linkedContactHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },

  contactLinkedDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.green,
    marginRight: 7,
  },

  linkedContactTitle: {
    color: COLORS.green,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1,
  },

  guideHero: {
    backgroundColor: "#08151A",
    borderRadius: 21,
    borderWidth: 1,
    borderColor: "#16404A",
    padding: 22,
    alignItems: "center",
    marginBottom: 14,
  },

  guideHeroIcon: {
    fontSize: 38,
    marginBottom: 8,
  },

  guideHeroTitle: {
    color: COLORS.white,
    fontSize: 20,
    fontWeight: "900",
    textAlign: "center",
  },

  guideHeroText: {
    color: COLORS.muted,
    fontSize: 11,
    lineHeight: 17,
    textAlign: "center",
    marginTop: 7,
  },

  guideItem: {
    flexDirection: "row",
    backgroundColor: COLORS.card,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 15,
    marginBottom: 10,
  },

  guideNumber: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: "#092A34",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  guideNumberText: {
    color: COLORS.cyan,
    fontSize: 10,
    fontWeight: "900",
  },

  guideItemTitle: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: "900",
  },

  guideItemText: {
    color: COLORS.muted,
    fontSize: 10,
    lineHeight: 16,
    marginTop: 4,
  },

  moreHero: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#07151A",
    borderRadius: 21,
    borderWidth: 1,
    borderColor: "#16404A",
    padding: 18,
    marginBottom: 15,
  },

  moreHeroIcon: {
    color: COLORS.cyan,
    fontSize: 38,
    marginRight: 14,
  },

  moreHeroTitle: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: "900",
  },

  moreHeroText: {
    color: COLORS.muted,
    fontSize: 10,
    lineHeight: 15,
    marginTop: 4,
  },

  moreGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  moreCard: {
    width: "48.5%",
    minHeight: 145,
    backgroundColor: COLORS.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 15,
    marginBottom: 10,
    position: "relative",
  },

  moreCardIcon: {
    fontSize: 24,
    marginBottom: 11,
  },

  moreCardTitle: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: "900",
  },

  moreCardText: {
    color: COLORS.muted,
    fontSize: 9,
    lineHeight: 14,
    marginTop: 5,
    paddingRight: 8,
  },

  moreCardArrow: {
    position: "absolute",
    right: 12,
    bottom: 10,
    color: COLORS.cyan,
    fontSize: 22,
  },

  /* BOTTOM NAV */

  bottomNav: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: Platform.OS === "ios" ? 88 : 72,
    paddingBottom:
      Platform.OS === "ios" ? 20 : 5,
    paddingTop: 7,
    backgroundColor: "#080C12",
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    flexDirection: "row",
    justifyContent: "space-around",
  },

  navItem: {
    width: "20%",
    alignItems: "center",
    justifyContent: "center",
  },

  navIconContainer: {
    width: 35,
    height: 30,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },

  navIconActive: {
    backgroundColor: "#092731",
  },

  navIcon: {
    fontSize: 17,
    color: COLORS.muted,
  },

  navIconSelected: {
    color: COLORS.cyan,
  },

  navLabel: {
    color: COLORS.muted,
    fontSize: 7,
    marginTop: 3,
    fontWeight: "700",
  },

  navLabelSelected: {
    color: COLORS.cyan,
  },
});