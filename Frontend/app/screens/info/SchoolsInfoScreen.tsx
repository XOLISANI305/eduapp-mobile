import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity
} from "react-native";
import { useRouter, Stack } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";

const provinces = [

{
name: "KwaZulu-Natal",
schools: [
{ name: "Durban High School", address: "255 St Thomas Rd, Musgrave, Durban", rating: "4.8" },
{ name: "Glenwood High School", address: "10 Glenwood Rd, Durban", rating: "4.7" },
{ name: "Westville Boys High", address: "Westville, Durban", rating: "4.7" },
{ name: "Northwood School", address: "Durban North", rating: "4.6" },
{ name: "Maritzburg College", address: "Pietermaritzburg", rating: "4.8" },
{ name: "Hilton College", address: "Hilton", rating: "4.9" },
{ name: "Michaelhouse", address: "Balgowan Midlands", rating: "4.8" },
{ name: "St Charles College", address: "Pietermaritzburg", rating: "4.7" },
{ name: "Kearsney College", address: "Botha's Hill", rating: "4.8" },
{ name: "Pinetown Boys High", address: "Pinetown", rating: "4.6" }
]
},

{
name: "Gauteng",
schools: [
{ name: "St Stithians College", address: "Sandton, Johannesburg", rating: "4.9" },
{ name: "King Edward VII School", address: "Houghton, Johannesburg", rating: "4.8" },
{ name: "Parktown Boys High", address: "Parktown, Johannesburg", rating: "4.7" },
{ name: "Roedean School", address: "Parktown, Johannesburg", rating: "4.8" },
{ name: "Pretoria Boys High", address: "Brooklyn, Pretoria", rating: "4.8" },
{ name: "Pretoria High School for Girls", address: "Hatfield, Pretoria", rating: "4.7" },
{ name: "Afrikaanse Hoër Seunskool", address: "Pretoria", rating: "4.6" },
{ name: "Hoërskool Menlopark", address: "Menlo Park, Pretoria", rating: "4.7" },
{ name: "St Mary's School Waverley", address: "Johannesburg", rating: "4.8" },
{ name: "Redhill School", address: "Sandton", rating: "4.7" }
]
},

{
name: "Western Cape",
schools: [
{ name: "Rondebosch Boys High", address: "Rondebosch, Cape Town", rating: "4.8" },
{ name: "Bishops Diocesan College", address: "Rondebosch, Cape Town", rating: "4.9" },
{ name: "Rustenburg Girls High", address: "Rondebosch, Cape Town", rating: "4.7" },
{ name: "Wynberg Boys High", address: "Wynberg, Cape Town", rating: "4.8" },
{ name: "Westerford High School", address: "Newlands, Cape Town", rating: "4.7" },
{ name: "SACS High School", address: "Newlands, Cape Town", rating: "4.7" },
{ name: "Paul Roos Gymnasium", address: "Stellenbosch", rating: "4.8" },
{ name: "Parel Vallei High", address: "Somerset West", rating: "4.7" },
{ name: "Stellenberg High School", address: "Durbanville", rating: "4.6" },
{ name: "Fairmont High School", address: "Durbanville", rating: "4.6" }
]
},

{
name: "Eastern Cape",
schools: [
{ name: "Grey High School", address: "Gqeberha", rating: "4.8" },
{ name: "Victoria Park High", address: "Gqeberha", rating: "4.7" },
{ name: "Selborne College", address: "East London", rating: "4.8" },
{ name: "Clarendon Girls High", address: "East London", rating: "4.7" },
{ name: "St Andrew's College", address: "Makhanda", rating: "4.8" },
{ name: "Kingswood College", address: "Makhanda", rating: "4.7" },
{ name: "Queen's College", address: "Komani", rating: "4.6" },
{ name: "Hudson Park High", address: "East London", rating: "4.6" },
{ name: "Cambridge High School", address: "East London", rating: "4.6" },
{ name: "Alexander Road High", address: "Gqeberha", rating: "4.5" }
]
},

{
name: "Free State",
schools: [
{ name: "Grey College", address: "Bloemfontein", rating: "4.9" },
{ name: "Eunice High School", address: "Bloemfontein", rating: "4.8" },
{ name: "St Andrew's School", address: "Bloemfontein", rating: "4.7" },
{ name: "Hoërskool Sentraal", address: "Bloemfontein", rating: "4.6" },
{ name: "Jim Fouche High", address: "Bloemfontein", rating: "4.6" },
{ name: "Welkom Gymnasium", address: "Welkom", rating: "4.5" },
{ name: "Trio High School", address: "Kroonstad", rating: "4.5" },
{ name: "Hoërskool Fichardtpark", address: "Bloemfontein", rating: "4.6" },
{ name: "Voortrekker High", address: "Bethlehem", rating: "4.5" },
{ name: "Harrismith High", address: "Harrismith", rating: "4.5" }
]
},

{
name: "Limpopo",
schools: [
{ name: "Pietersburg High", address: "Polokwane", rating: "4.6" },
{ name: "Capricorn High", address: "Polokwane", rating: "4.6" },
{ name: "Merensky High", address: "Tzaneen", rating: "4.5" },
{ name: "Ben Vorster High", address: "Tzaneen", rating: "4.5" },
{ name: "Hoërskool Piet Potgieter", address: "Mokopane", rating: "4.5" },
{ name: "Nico Malan High", address: "Polokwane", rating: "4.4" },
{ name: "Mopani High", address: "Phalaborwa", rating: "4.4" },
{ name: "Letaba High", address: "Tzaneen", rating: "4.4" },
{ name: "Mbilwi Secondary School", address: "Thohoyandou", rating: "4.6" },
{ name: "Makhado High School", address: "Louis Trichardt", rating: "4.4" }
]
},

{
name: "Mpumalanga",
schools: [
{ name: "Hoërskool Nelspruit", address: "Mbombela", rating: "4.6" },
{ name: "Penryn College", address: "White River", rating: "4.7" },
{ name: "Curro Nelspruit", address: "Mbombela", rating: "4.6" },
{ name: "Rob Ferreira High", address: "White River", rating: "4.6" },
{ name: "Ermelo High School", address: "Ermelo", rating: "4.5" },
{ name: "Middelburg High", address: "Middelburg", rating: "4.5" },
{ name: "Lydenburg High", address: "Lydenburg", rating: "4.4" },
{ name: "Secunda High", address: "Secunda", rating: "4.4" },
{ name: "Standerton High", address: "Standerton", rating: "4.4" },
{ name: "Barberton High", address: "Barberton", rating: "4.3" }
]
},

{
name: "Northern Cape",
schools: [
{ name: "Diamantveld High", address: "Kimberley", rating: "4.5" },
{ name: "Kimberley Boys High", address: "Kimberley", rating: "4.5" },
{ name: "Kimberley Girls High", address: "Kimberley", rating: "4.5" },
{ name: "Northern Cape High", address: "Kimberley", rating: "4.4" },
{ name: "Upington High", address: "Upington", rating: "4.4" },
{ name: "De Aar High", address: "De Aar", rating: "4.3" },
{ name: "Postmasburg High", address: "Postmasburg", rating: "4.3" },
{ name: "Kuruman High", address: "Kuruman", rating: "4.3" },
{ name: "Douglas High", address: "Douglas", rating: "4.2" },
{ name: "Colesberg High", address: "Colesberg", rating: "4.2" }
]
},

{
name: "North West",
schools: [
{ name: "Potchefstroom Gimnasium", address: "Potchefstroom", rating: "4.7" },
{ name: "Potchefstroom Boys High", address: "Potchefstroom", rating: "4.6" },
{ name: "Rustenburg High School", address: "Rustenburg", rating: "4.5" },
{ name: "Hoërskool Bergsig", address: "Rustenburg", rating: "4.5" },
{ name: "Lichtenburg High", address: "Lichtenburg", rating: "4.4" },
{ name: "Klerksdorp High", address: "Klerksdorp", rating: "4.4" },
{ name: "Wolmaransstad High", address: "Wolmaransstad", rating: "4.3" },
{ name: "Vryburg High", address: "Vryburg", rating: "4.3" },
{ name: "Mahikeng High", address: "Mahikeng", rating: "4.3" },
{ name: "Brits High", address: "Brits", rating: "4.2" }
]
}

];

export default function SchoolsInfoScreen() {
  const router = useRouter();

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.container}>

        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <MaterialIcons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Browse Schools by Province</Text>

          <View style={{ width: 24 }} />
        </View>

        <ScrollView style={styles.content}>
          {provinces.map((province, index) => (
            <View key={index} style={styles.provinceSection}>

              <Text style={styles.provinceTitle}>{province.name}</Text>

              {province.schools.map((school, i) => (
                <View key={i} style={styles.schoolCard}>

                  <View style={styles.schoolTop}>
                    <Text style={styles.schoolName}>{school.name}</Text>

                    <View style={styles.rating}>
                      <MaterialIcons name="star" size={14} color="#FFD700" />
                      <Text style={styles.ratingText}>{school.rating}</Text>
                    </View>
                  </View>

                  <Text style={styles.schoolAddress}>
                    📍 {school.address}
                  </Text>

                </View>
              ))}

            </View>
          ))}
        </ScrollView>

      </View>
    </>
  );
}

const styles = StyleSheet.create({

container:{ flex:1, backgroundColor:"#F8FAFC" },

header:{
backgroundColor:"#667eea",
paddingTop:60,
paddingBottom:20,
paddingHorizontal:20,
flexDirection:"row",
alignItems:"center",
justifyContent:"space-between"
},

headerTitle:{ color:"#fff", fontSize:18, fontWeight:"bold" },

content:{ padding:20 },

provinceSection:{ marginBottom:30 },

provinceTitle:{
fontSize:22,
fontWeight:"bold",
marginBottom:15,
color:"#1E293B"
},

schoolCard:{
backgroundColor:"#fff",
padding:16,
borderRadius:14,
marginBottom:12,
shadowColor:"#000",
shadowOpacity:0.1,
shadowRadius:5,
elevation:3
},

schoolTop:{
flexDirection:"row",
justifyContent:"space-between",
alignItems:"center"
},

schoolName:{ fontSize:16, fontWeight:"bold", color:"#1E293B" },

rating:{ flexDirection:"row", alignItems:"center" },

ratingText:{ marginLeft:4, fontWeight:"600" },

schoolAddress:{ marginTop:6, color:"#64748B", fontSize:13 }

});