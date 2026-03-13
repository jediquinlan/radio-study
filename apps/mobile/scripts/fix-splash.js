const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const splashSrc = path.join(root, "assets", "images", "splash-icon.png");
const iosProject = path.join(root, "ios", "radiolingo");
const imagesetDir = path.join(
  iosProject,
  "Images.xcassets",
  "SplashScreenLogo.imageset"
);
const storyboardPath = path.join(iosProject, "SplashScreen.storyboard");

if (!fs.existsSync(splashSrc)) {
  console.error("Splash source not found:", splashSrc);
  process.exit(1);
}

// Create imageset directory if it doesn't exist
if (!fs.existsSync(imagesetDir)) {
  fs.mkdirSync(imagesetDir, { recursive: true });
  console.log("Created SplashScreenLogo.imageset directory.");
}

// Write Contents.json
fs.writeFileSync(
  path.join(imagesetDir, "Contents.json"),
  JSON.stringify(
    {
      images: [
        { idiom: "universal", filename: "image.png", scale: "1x" },
        { idiom: "universal", filename: "image@2x.png", scale: "2x" },
        { idiom: "universal", filename: "image@3x.png", scale: "3x" },
      ],
      info: { version: 1, author: "expo" },
    },
    null,
    2
  )
);

// Generate properly scaled images using sips (macOS)
// Source is @3x resolution (1376x3072). Scale down for 1x and 2x.
const { execSync } = require("child_process");

// @3x — use original
fs.copyFileSync(splashSrc, path.join(imagesetDir, "image@3x.png"));

// @2x — 2/3 of original
const img2x = path.join(imagesetDir, "image@2x.png");
fs.copyFileSync(splashSrc, img2x);
execSync(
  `sips --resampleWidth 917 "${img2x}" > /dev/null 2>&1`
);

// @1x — 1/3 of original
const img1x = path.join(imagesetDir, "image.png");
fs.copyFileSync(splashSrc, img1x);
execSync(
  `sips --resampleWidth 459 "${img1x}" > /dev/null 2>&1`
);

console.log("Splash images written (properly scaled for 1x/2x/3x).");

// Write the full storyboard (don't try to patch — just overwrite)
const STORYBOARD = `<?xml version="1.0" encoding="UTF-8"?>
<document type="com.apple.InterfaceBuilder3.CocoaTouch.Storyboard.XIB" version="3.0" toolsVersion="24093.7" targetRuntime="iOS.CocoaTouch" propertyAccessControl="none" useAutolayout="YES" launchScreen="YES" useTraitCollections="YES" useSafeAreas="YES" colorMatched="YES" initialViewController="EXPO-VIEWCONTROLLER-1">
    <device id="retina6_12" orientation="portrait" appearance="light"/>
    <dependencies>
        <deployment identifier="iOS"/>
        <plugIn identifier="com.apple.InterfaceBuilder.IBCocoaTouchPlugin" version="24053.1"/>
        <capability name="Named colors" minToolsVersion="9.0"/>
        <capability name="Safe area layout guides" minToolsVersion="9.0"/>
        <capability name="System colors in document resources" minToolsVersion="11.0"/>
        <capability name="documents saved in the Xcode 8 format" minToolsVersion="8.0"/>
    </dependencies>
    <scenes>
        <scene sceneID="EXPO-SCENE-1">
            <objects>
                <viewController storyboardIdentifier="SplashScreenViewController" id="EXPO-VIEWCONTROLLER-1" sceneMemberID="viewController">
                    <view key="view" userInteractionEnabled="NO" contentMode="scaleToFill" insetsLayoutMarginsFromSafeArea="NO" id="EXPO-ContainerView" userLabel="ContainerView">
                        <rect key="frame" x="0.0" y="0.0" width="393" height="852"/>
                        <autoresizingMask key="autoresizingMask" flexibleMaxX="YES" flexibleMaxY="YES"/>
                        <subviews>
                            <imageView id="EXPO-SplashScreen" userLabel="SplashScreenLogo" image="SplashScreenLogo" contentMode="scaleAspectFill" clipsSubviews="true" userInteractionEnabled="false" translatesAutoresizingMaskIntoConstraints="false">
                                <rect key="frame" x="0" y="0" width="393" height="852"/>
                            </imageView>
                        </subviews>
                        <viewLayoutGuide key="safeArea" id="Rmq-lb-GrQ"/>
                        <constraints>
                            <constraint firstItem="EXPO-SplashScreen" firstAttribute="top" secondItem="EXPO-ContainerView" secondAttribute="top" id="top"/>
                            <constraint firstItem="EXPO-SplashScreen" firstAttribute="bottom" secondItem="EXPO-ContainerView" secondAttribute="bottom" id="bottom"/>
                            <constraint firstItem="EXPO-SplashScreen" firstAttribute="leading" secondItem="EXPO-ContainerView" secondAttribute="leading" id="leading"/>
                            <constraint firstItem="EXPO-SplashScreen" firstAttribute="trailing" secondItem="EXPO-ContainerView" secondAttribute="trailing" id="trailing"/>
                        </constraints>
                        <color key="backgroundColor" name="SplashScreenBackground"/>
                    </view>
                </viewController>
                <placeholder placeholderIdentifier="IBFirstResponder" id="EXPO-PLACEHOLDER-1" userLabel="First Responder" sceneMemberID="firstResponder"/>
            </objects>
            <point key="canvasLocation" x="0.0" y="0.0"/>
        </scene>
    </scenes>
    <resources>
        <image name="SplashScreenLogo" width="1376" height="3072"/>
        <systemColor name="systemBackgroundColor">
            <color white="1" alpha="1" colorSpace="custom" customColorSpace="genericGamma22GrayColorSpace"/>
        </systemColor>
        <namedColor name="SplashScreenBackground">
            <color alpha="1.000" blue="1.00000000000000" green="1.00000000000000" red="1.00000000000000" customColorSpace="sRGB" colorSpace="custom"/>
        </namedColor>
    </resources>
</document>`;

fs.writeFileSync(storyboardPath, STORYBOARD);
console.log("Storyboard overwritten with full-screen splash.");
