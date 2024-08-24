import { StyleSheet } from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

export const dashboardStyle = StyleSheet.create({
    linearGradient: {
      flex: 1,
      alignItems: "center",
      justifyContent: "flex-start",
    },
    headerContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      width: "100%",
      paddingHorizontal: 20,
      paddingVertical: 10,
      paddingTop: 30,
      backgroundColor: "#FFFFDD",
      borderBottomWidth: 1,
      borderBottomColor: "#ddd",
      zIndex: 10,
    },
    welcomeText: {
      fontSize: 24,
      color: "#2F3645",
      fontWeight: "bold",
    },
    iconContainer: {
      flexDirection: "row",
      alignItems: "center",
    },
    iconButton: {
      padding: 10,
    },
    logoutIcon: {
      marginLeft: 20,
    },
    firstContainer: {
      alignItems: "center",
      marginTop: 200,
      paddingHorizontal: 20,
      width: "100%",
    },
    logoContainer: {
      alignItems: "center",
      justifyContent: "center",
      position: "relative",
    },
    logo: {
      width: wp("80%"),
      height: hp("20%"),
      resizeMode: "contain",
      position: "absolute",
      top: 0,
      zIndex: 1,
    },
    titleTextShape1: {
      width: wp("30%"),
      height: hp("15%"),
      resizeMode: "contain",
      position: "absolute",
      left: -100,
      top: 10,
      zIndex: 0,
    },
    titleTextShape2: {
      width: wp("20%"),
      height: hp("20%"),
      resizeMode: "contain",
      position: "absolute",
      right: -100,
      top: 30,
      zIndex: 0,
    },
    titleShape3: {
      width: wp("40%"),
      height: hp("19%"),
      resizeMode: "contain",
      zIndex: 0,
    },
    dscpWrapper: {
      marginTop: 20,
      alignItems: "center",
    },
    dscpText: {
      fontSize: 18,
      color: "#2F3645",
    },
    buttonWrapperContainer: {
      marginTop: 100, // Adjusted margin
      width: "100%",
      alignItems: "center",
    },
    tabContainer: {
      flexDirection: "row",
      marginTop: 100,
      width: "100%",
      justifyContent: "center",
    },
    tabButton: {
      flex: 1,
      paddingVertical: 10,
      alignItems: "center",
      borderBottomWidth: 2,
      borderBottomColor: "transparent",
    },
    tabButtonText: {
      fontSize: 16,
      color: "#2F3645",
    },
    activeTab: {
      borderBottomColor: "#2F3645",
    },
    buttonWrapper: {
      backgroundColor: "yellowgreen",
      padding: 15,
      borderRadius: 5,
      marginVertical: 10,
      elevation: 3,
      alignItems: "center",
    },
    buttonText: {
      fontSize: 16,
      color: "aliceblue",
    },
  });
  