import { NextResponse } from 'next/server'
import path from 'path'
import fs from 'fs'

const RAW_CANDIDATES = [
  {"slug":"fletcher-sewer-drain","company":"Fletcher Sewer & Drain","owner":"","phone":"+14137887200","city":"Ludlow","state":"MA","variant":"V1_BALANCED","tzCategory":"EST"},
  {"slug":"hamm-septic-services","company":"Hamm Septic Services","owner":"","phone":"+16034347701","city":"Hudson","state":"NH","variant":"V2_ULTRA_SHORT","tzCategory":"EST"},
  {"slug":"all-pro-enviro","company":"All Pro Enviro","owner":"","phone":"+17046041735","city":"Lincolnton","state":"NC","variant":"V3_SAFETY_FIRST","tzCategory":"EST"},
  {"slug":"jc-septic","company":"JC Septic","owner":"","phone":"+14435216606","city":"Salisbury","state":"MD","variant":"V1_BALANCED","tzCategory":"EST"},
  {"slug":"davis-concrete-products-inc","company":"Davis Concrete Products Inc.","owner":"","phone":"+13342984620","city":"Phenix City","state":"AL","variant":"V2_ULTRA_SHORT","tzCategory":"EST"},
  {"slug":"sewer-technology-llc","company":"Sewer Technology LLC","owner":"","phone":"+12164083851","city":"Cleveland","state":"OH","variant":"V3_SAFETY_FIRST","tzCategory":"EST"},
  {"slug":"the-sewer-doctors","company":"The Sewer Doctors","owner":"","phone":"+18167828379","city":"Kansas City","state":"MO","variant":"V1_BALANCED","tzCategory":"EST"},
  {"slug":"mainline-inspection-services","company":"Mainline Inspection Services","owner":"","phone":"+14407851411","city":"Cleveland","state":"OH","variant":"V2_ULTRA_SHORT","tzCategory":"EST"},
  {"slug":"moores-plumbing-septic","company":"Moore's Plumbing & Septic","owner":"","phone":"+14107753696","city":"Carroll County","state":"MD","variant":"V3_SAFETY_FIRST","tzCategory":"EST"},
  {"slug":"bragg-waste-services-inc","company":"Bragg Waste Services Inc","owner":"","phone":"+17578278080","city":"Hampton","state":"VA","variant":"V1_BALANCED","tzCategory":"EST"},
  {"slug":"appalachian-pumping","company":"Appalachian Pumping","owner":"","phone":"+18287730999","city":"Boone","state":"NC","variant":"V2_ULTRA_SHORT","tzCategory":"EST"},
  {"slug":"wee-bee-waste-services","company":"Wee Bee Waste Services","owner":"","phone":"+14013977508","city":"Coventry","state":"RI","variant":"V3_SAFETY_FIRST","tzCategory":"EST"},
  {"slug":"hinson-septic-tank-pumping","company":"Hinson Septic Tank Pumping","owner":"","phone":"+18037302482","city":"Columbia","state":"SC","variant":"V1_BALANCED","tzCategory":"EST"},
  {"slug":"little-rooster-septic-service","company":"Little Rooster Septic Service","owner":"","phone":"+18287732296","city":"Boone","state":"NC","variant":"V2_ULTRA_SHORT","tzCategory":"EST"},
  {"slug":"white-knight-plumbing","company":"White Knight Plumbing","owner":"","phone":"+19198801538","city":"Raleigh","state":"NC","variant":"V3_SAFETY_FIRST","tzCategory":"EST"},
  {"slug":"allens-environmental-services-llc","company":"Allen's Environmental Services, LLC","owner":"","phone":"+18048248937","city":"Richmond","state":"VA","variant":"V1_BALANCED","tzCategory":"EST"},
  {"slug":"royal-flush-septic-tank-service","company":"Royal Flush Septic Tank Service","owner":"","phone":"+13344800960","city":"Columbus","state":"GA","variant":"V2_ULTRA_SHORT","tzCategory":"EST"},
  {"slug":"craven-ag-services-inc","company":"Craven Ag Services, Inc.","owner":"","phone":"+12526330456","city":"New Bern","state":"NC","variant":"V3_SAFETY_FIRST","tzCategory":"EST"},
  {"slug":"local-septic-environmental-services-llc","company":"Local Septic & Environmental Services LLC","owner":"","phone":"+18432292398","city":"Florence","state":"SC","variant":"V1_BALANCED","tzCategory":"EST"},
  {"slug":"morgantown-septic-tank-service","company":"Morgantown Septic Tank Service","owner":"","phone":"+13042967676","city":"Morgantown","state":"WV","variant":"V2_ULTRA_SHORT","tzCategory":"EST"},
  {"slug":"sfi-environmental","company":"SFI Environmental","owner":"","phone":"+14107584144","city":"Centerville","state":"MD","variant":"V3_SAFETY_FIRST","tzCategory":"EST"},
  {"slug":"tideland-grease-trap-septic-service","company":"Tideland Grease Trap & Septic Service","owner":"","phone":"+18433333333","city":"Conway","state":"SC","variant":"V1_BALANCED","tzCategory":"EST"},
  {"slug":"lakeside-septic","company":"Lakeside Septic","owner":"","phone":"+13522364456","city":"Ocala","state":"FL","variant":"V2_ULTRA_SHORT","tzCategory":"EST"},
  {"slug":"stones-septic-service","company":"Stones' Septic Service","owner":"","phone":"+16033543391","city":"Swanzey","state":"NH","variant":"V3_SAFETY_FIRST","tzCategory":"EST"},
  {"slug":"jerrys-septic-tank-services","company":"Jerry's Septic Tank Services","owner":"","phone":"+17575668555","city":"Barhamsville","state":"VA","variant":"V1_BALANCED","tzCategory":"EST"},
  {"slug":"drain-master-nc","company":"Drain Master NC","owner":"","phone":"+19109311925","city":"Wilmington","state":"NC","variant":"V2_ULTRA_SHORT","tzCategory":"EST"},
  {"slug":"turdbusters","company":"Turdbusters","owner":"","phone":"+15407763200","city":"Roanoke","state":"VA","variant":"V3_SAFETY_FIRST","tzCategory":"EST"},
  {"slug":"purge-environmental","company":"Purge Environmental","owner":"","phone":"+13179997366","city":"Indianapolis","state":"IN","variant":"V1_BALANCED","tzCategory":"CST"},
  {"slug":"dependable-drain-cleaning-and-plumbing-repairs-llc","company":"Dependable Drain Cleaning And Plumbing Repairs LLC","owner":"","phone":"+13378531558","city":"Lake Charles","state":"LA","variant":"V2_ULTRA_SHORT","tzCategory":"CST"},
  {"slug":"roto-rooter-of-hattiesburg","company":"Roto-Rooter of Hattiesburg","owner":"","phone":"+16012158626","city":"Hattiesburg","state":"MS","variant":"V3_SAFETY_FIRST","tzCategory":"CST"},
  {"slug":"asap-septic-pumping-llc","company":"ASAP SEPTIC PUMPING LLC","owner":"","phone":"+13184693481","city":"Bossier City","state":"LA","variant":"V1_BALANCED","tzCategory":"CST"},
  {"slug":"all-dry-services-kansas-city","company":"All Dry Services Kansas City","owner":"","phone":"+19139097782","city":"Kansas City","state":"MO","variant":"V2_ULTRA_SHORT","tzCategory":"CST"},
  {"slug":"greenup-lawn-landscape-sprinklers","company":"Greenup Lawn, Landscape, & Sprinklers","owner":"","phone":"+14022894103","city":"Elkhorn","state":"NE","variant":"V3_SAFETY_FIRST","tzCategory":"CST"},
  {"slug":"brazos-septic-solutions","company":"Brazos Septic Solutions","owner":"","phone":"+19794025008","city":"Bryan","state":"TX","variant":"V1_BALANCED","tzCategory":"CST"},
  {"slug":"emergency-sewer-and-drain","company":"Emergency Sewer and Drain","owner":"","phone":"+13175220228","city":"Indianapolis","state":"IN","variant":"V2_ULTRA_SHORT","tzCategory":"CST"},
  {"slug":"jmb-septic-service","company":"JMB Septic Service","owner":"","phone":"+14175312068","city":"West Plains","state":"MO","variant":"V3_SAFETY_FIRST","tzCategory":"CST"},
  {"slug":"dependable-plumbing-rooter-service-llc","company":"Dependable Plumbing & Rooter Service LLC","owner":"","phone":"+18158744000","city":"Rockford","state":"IL","variant":"V1_BALANCED","tzCategory":"CST"},
  {"slug":"bobs-sewerooter-services","company":"Bob's Sewerooter Services","owner":"","phone":"+18122671778","city":"New Albany","state":"IN","variant":"V2_ULTRA_SHORT","tzCategory":"CST"},
  {"slug":"double-deuce-septic-service","company":"Double Deuce Septic Service","owner":"","phone":"+19363556100","city":"Crockett","state":"TX","variant":"V3_SAFETY_FIRST","tzCategory":"CST"},
  {"slug":"rics-sewer-services-llc","company":"Ric's Sewer Services LLC","owner":"","phone":"+19208577741","city":"Green Bay","state":"WI","variant":"V1_BALANCED","tzCategory":"CST"},
  {"slug":"boyetts-septic-tank-portable-toilets","company":"Boyett's Septic Tank & Portable Toilets","owner":"","phone":"+18509949989","city":"Pace","state":"FL","variant":"V2_ULTRA_SHORT","tzCategory":"CST"},
  {"slug":"bar-j-septic-services","company":"Bar J Septic Services","owner":"","phone":"+19367157811","city":"Nacogdoches","state":"TX","variant":"V3_SAFETY_FIRST","tzCategory":"CST"},
  {"slug":"macs-septic-llc","company":"Mac's Septic LLC","owner":"","phone":"+19183416227","city":"Claremore","state":"OK","variant":"V1_BALANCED","tzCategory":"CST"},
  {"slug":"warrior-pumping","company":"Warrior Pumping","owner":"","phone":"+12055655160","city":"Warrior","state":"AL","variant":"V2_ULTRA_SHORT","tzCategory":"CST"},
  {"slug":"southeast-iowa-sewer-services","company":"Southeast Iowa Sewer Services","owner":"","phone":"+13192091400","city":"West Burlington","state":"IA","variant":"V3_SAFETY_FIRST","tzCategory":"CST"},
  {"slug":"big-dog-septic","company":"Big Dog Septic","owner":"","phone":"+18658880345","city":"Knoxville","state":"TN","variant":"V1_BALANCED","tzCategory":"CST"},
  {"slug":"fatboy-grease-trap-services","company":"Fatboy Grease Trap Services","owner":"","phone":"+17154569300","city":"Eau Claire","state":"WI","variant":"V2_ULTRA_SHORT","tzCategory":"CST"},
  {"slug":"adams-septic-services-inc","company":"Adam's Septic Services Inc","owner":"","phone":"+14237754316","city":"Dayton","state":"TN","variant":"V3_SAFETY_FIRST","tzCategory":"CST"},
  {"slug":"dons-plumbing-repair-and-drain-cleaning","company":"Don's Plumbing Repair And Drain Cleaning","owner":"","phone":"+13193259926","city":"Iowa City","state":"IA","variant":"V1_BALANCED","tzCategory":"CST"},
  {"slug":"4-mile-septic","company":"4 Mile Septic","owner":"","phone":"+19362734458","city":"Conroe","state":"TX","variant":"V2_ULTRA_SHORT","tzCategory":"CST"},
  {"slug":"plumbtech","company":"PlumbTech","owner":"","phone":"+12056686000","city":"Calera","state":"AL","variant":"V3_SAFETY_FIRST","tzCategory":"CST"},
  {"slug":"soco-septic-service-llc","company":"Soco Septic Service, LLC","owner":"","phone":"+19366373784","city":"Lufkin","state":"TX","variant":"V1_BALANCED","tzCategory":"CST"},
  {"slug":"american-pumping","company":"American Pumping","owner":"","phone":"+14234720918","city":"Cleveland","state":"TN","variant":"V2_ULTRA_SHORT","tzCategory":"CST"},
  {"slug":"hardin-county-septic-services","company":"Hardin County Septic Services","owner":"","phone":"+12707359710","city":"Elizabethtown","state":"KY","variant":"V3_SAFETY_FIRST","tzCategory":"CST"},
  {"slug":"new-era-plumbing-inc","company":"New Era Plumbing, Inc.","owner":"","phone":"+12052080100","city":"Birmingham","state":"AL","variant":"V1_BALANCED","tzCategory":"CST"},
  {"slug":"pro-services-plumbing-drains-sewer-lining","company":"Pro Services Plumbing, Drains, Sewer Lining","owner":"Mike","phone":"+13346513360","city":"Montgomery","state":"AL","variant":"V2_ULTRA_SHORT","tzCategory":"CST"},
  {"slug":"nu-flow-tucson","company":"Nu Flow Tucson","owner":"Peter","phone":"+15209802373","city":"Tucson","state":"AZ","variant":"V3_SAFETY_FIRST","tzCategory":"MST"},
  {"slug":"aj-mcdonald-company","company":"AJ McDonald Company","owner":"","phone":"+12083907559","city":"Rigby","state":"ID","variant":"V1_BALANCED","tzCategory":"MST"},
  {"slug":"just-send-it-drain-cleaning","company":"Just Send It Drain Cleaning","owner":"","phone":"+14064391515","city":"Helena","state":"MT","variant":"V2_ULTRA_SHORT","tzCategory":"MST"},
  {"slug":"ned-carnett-septic-service","company":"Ned Carnett Septic Service","owner":"","phone":"+19284285817","city":"Safford","state":"AZ","variant":"V3_SAFETY_FIRST","tzCategory":"MST"},
  {"slug":"colorado-pumping","company":"Colorado Pumping","owner":"","phone":"+13038414434","city":"Parker","state":"CO","variant":"V1_BALANCED","tzCategory":"MST"},
  {"slug":"on-the-way-plumbing","company":"On The Way Plumbing","owner":"Sergio","phone":"+15204445885","city":"Tucson","state":"AZ","variant":"V2_ULTRA_SHORT","tzCategory":"MST"},
  {"slug":"east-mountain-pumping-and-septic-services-inc","company":"East Mountain Pumping and Septic Services Inc","owner":"","phone":"+15052864696","city":"Edgewood","state":"NM","variant":"V3_SAFETY_FIRST","tzCategory":"MST"},
  {"slug":"boonstra-excavation-llc","company":"Boonstra Excavation LLC","owner":"","phone":"+17192404090","city":"Pueblo","state":"CO","variant":"V1_BALANCED","tzCategory":"MST"},
  {"slug":"father-sons-plumbing-drain","company":"Father & Sons Plumbing & Drain","owner":"Ray","phone":"+17196837200","city":"Colorado Springs","state":"CO","variant":"V2_ULTRA_SHORT","tzCategory":"MST"},
  {"slug":"caitco-drainworks","company":"CaitCo Drainworks","owner":"","phone":"+15054249191","city":"Santa Fe","state":"NM","variant":"V3_SAFETY_FIRST","tzCategory":"MST"},
  {"slug":"tucson-plumbing-solutions","company":"Tucson Plumbing Solutions","owner":"Leonard","phone":"+15203366055","city":"Tucson","state":"AZ","variant":"V1_BALANCED","tzCategory":"MST"},
  {"slug":"west-side-drain-and-septic","company":"West Side Drain and Septic","owner":"","phone":"+15033342228","city":"Hillsboro","state":"OR","variant":"V2_ULTRA_SHORT","tzCategory":"PST"},
  {"slug":"rescue-hero-plumbing-pumping","company":"Rescue Hero Plumbing & Pumping","owner":"","phone":"+16615878260","city":"Bakersfield","state":"CA","variant":"V3_SAFETY_FIRST","tzCategory":"PST"},
  {"slug":"north-bay-restaurant-services","company":"North Bay Restaurant Services","owner":"Eddie","phone":"+17078249737","city":"Santa Rosa","state":"CA","variant":"V1_BALANCED","tzCategory":"PST"},
  {"slug":"millennium-plumbing-specialist-inc","company":"Millennium Plumbing Specialist, Inc","owner":"Luis","phone":"+19163013898","city":"Sacramento","state":"CA","variant":"V2_ULTRA_SHORT","tzCategory":"PST"},
  {"slug":"allstarz-pumping-engineering","company":"AllStarz Pumping & Engineering","owner":"","phone":"+15598218177","city":"Clovis","state":"CA","variant":"V3_SAFETY_FIRST","tzCategory":"PST"},
  {"slug":"grants-drain-care","company":"Grant’s Drain Care","owner":"","phone":"+15412952865","city":"Medford","state":"OR","variant":"V1_BALANCED","tzCategory":"PST"},
  {"slug":"green-latrine","company":"Green Latrine","owner":"","phone":"+12063970337","city":"Seattle","state":"WA","variant":"V2_ULTRA_SHORT","tzCategory":"PST"},
  {"slug":"gordons-plumbing-piping","company":"Gordon's Plumbing Piping","owner":"Gordon","phone":"+19163080641","city":"Sacramento","state":"CA","variant":"V3_SAFETY_FIRST","tzCategory":"PST"},
  {"slug":"eagle-septic","company":"Eagle Septic","owner":"","phone":"+15306774640","city":"El Dorado Hills","state":"CA","variant":"V1_BALANCED","tzCategory":"PST"},
  {"slug":"jones-septic-service","company":"Jones Septic Service","owner":"","phone":"+15597341999","city":"Visalia","state":"CA","variant":"V2_ULTRA_SHORT","tzCategory":"PST"},
  {"slug":"pacific-sanitation-services","company":"Pacific Sanitation Services","owner":"","phone":"+17075860111","city":"Rohnert Park","state":"CA","variant":"V3_SAFETY_FIRST","tzCategory":"PST"},
  {"slug":"sewer-rooter-plumbing-inc","company":"Sewer Rooter & Plumbing Inc","owner":"","phone":"+12067800000","city":"Bainbridge Island","state":"WA","variant":"V1_BALANCED","tzCategory":"PST"},
  {"slug":"the-septic-guys","company":"The Septic Guys","owner":"","phone":"+15595799920","city":"Fresno","state":"CA","variant":"V2_ULTRA_SHORT","tzCategory":"PST"}
]

function generateText(c: any): string {
  const greeting = c.owner && c.owner.trim() ? `Hey ${c.owner.trim()}` : `Hey guys`
  if (c.variant === 'V1_BALANCED') {
    return `${greeting}, know you're busy so I'll keep it short. Noticed you don't have a website on Google Maps, so put together a ready mobile site for ${c.company} with your machinery, reviews & services so local jobs don't slip to competitors.\n\nMind if I text you the link to take a quick look? If you like it, great - if not, I'll just delete it, no hard feelings.`
  }
  if (c.variant === 'V2_ULTRA_SHORT') {
    return `${greeting}, know you're busy - I'll be quick. Saw no website on your Google profile, so built one for ${c.company} with your real trucks, reviews & services so callers don't go to competitors.\n\nGot a couple mins if I shoot over the link? If you want to keep it, awesome - if not, I'll delete it, no problem.`
  }
  return `${greeting}, keeping this short since you're busy. Saw you don't have a site on Google Maps, so put together a live showcase for ${c.company} with your equipment, reviews & services to help catch jobs going to competitors.\n\nWant me to send the link over to check it out? If you like it, let me know - if not, I'll take it down, no sweat.`
}

export async function GET() {
  const items = RAW_CANDIDATES.map(c => ({
    phone: c.phone,
    company: c.company,
    text: generateText(c)
  }))

  return NextResponse.json(items)
}
