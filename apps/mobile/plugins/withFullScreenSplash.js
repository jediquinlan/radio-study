const { withDangerousMod } = require("expo/config-plugins");
const fs = require("fs");
const path = require("path");

const FULL_SCREEN_STORYBOARD = `<?xml version="1.0" encoding="UTF-8"?>
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

module.exports = function withFullScreenSplash(config) {
  return withDangerousMod(config, [
    "ios",
    async (config) => {
      const projectName = config.modRequest.projectName;
      const platformRoot = config.modRequest.platformProjectRoot;

      // Fix storyboard
      const storyboardPath = path.join(
        platformRoot,
        projectName,
        "SplashScreen.storyboard"
      );
      fs.writeFileSync(storyboardPath, FULL_SCREEN_STORYBOARD);

      // Fix splash image — copy full-size source into all scale slots
      const splashSrc = path.resolve(
        __dirname,
        "..",
        "assets",
        "images",
        "splash-icon.png"
      );
      const imagesetDir = path.join(
        platformRoot,
        projectName,
        "Images.xcassets",
        "SplashScreenLogo.imageset"
      );

      if (fs.existsSync(splashSrc) && fs.existsSync(imagesetDir)) {
        for (const name of ["image.png", "image@2x.png", "image@3x.png"]) {
          fs.copyFileSync(splashSrc, path.join(imagesetDir, name));
        }
      }

      // Patch SplashScreenManager.swift to skip creating the JS overlay.
      // This eliminates the low-res→high-res crossfade caused by iOS
      // transitioning between its cached launch screen and a second
      // programmatic storyboard instantiation.
      const splashManagerPath = path.join(
        platformRoot,
        "..",
        "node_modules",
        "expo-splash-screen",
        "ios",
        "SplashScreenManager.swift"
      );
      if (fs.existsSync(splashManagerPath)) {
        let swift = fs.readFileSync(splashManagerPath, "utf8");
        // Add early return to showSplashScreen() so no overlay is created
        if (!swift.includes("// PATCHED: skip overlay")) {
          swift = swift.replace(
            "private func showSplashScreen() {",
            "private func showSplashScreen() {\n    // PATCHED: skip overlay to prevent low-res crossfade\n    return"
          );
          fs.writeFileSync(splashManagerPath, swift);
        }
      }

      return config;
    },
  ]);
};
