const express = require('express');
const cors = require('cors');
require('dotenv').config();
const mainRouter = require('../backend_core/src/routes');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const app = express();
app.use(cors());
app.use(express.json());

const prisma = new PrismaClient();

// IMPORT FROM CSV (INLINED DATA - 148 CUSTOMERS)
app.get('/api/diag/import-from-csv', async (req, res) => {
    try {
        const csvData = `Customer ID;First Name;Last Name;Email;Accepts Email Marketing;Default Address Company;Default Address Address1;Default Address Address2;Default Address City;Default Address Province Code;Default Address Country Code;Default Address Zip;Default Address Phone;Phone;Accepts SMS Marketing;Total Spent;Total Orders;Note;Tax Exempt
'6795875909896;NTW;8.0;teresa@ntw80.com;yes;NTW 8.0;Via Claudio Treves 61;IT11717640962;Trezzano sul Naviglio;MI;IT;20090;'+39 329 3765713;;no;30853.72;20;;no
'6795920965896;KALOS;ARREDAMENTI;kalosarr@libero.it;yes;KALOS Arredamenti;Corso Umberto 425;;Caivano;NA;IT;80023;;;no;3703.00;21;;no
'6795951603976;CELIENTO LUXURY;SRL;info@celientoshop.com;yes;Celiento Luxury Srl;via nettuno I lotto snc;IT06545871219;Sant'antimo;NA;IT;80029;;;no;22311.05;49;;no
'6804168311048;NOBILI;ANTICHITÀ di Massimo Nobili;nobiliantichit@yahoo.it;yes;Nobili Antichità di Massimo Nobili;VIA MARITTIMA 274;IT01992220606;Frosinone;FR;IT;'03100;;;no;174.74;1;;no
'6805568651528;LE GEMME;di Amalia Pellegrino;info@legemme.net;yes;Le Gemme di Pellegrino Amalia;Via del Giglio, 36;IT04186470615;San cipriano di aversa;CE;IT;81036;'3887540412;'+393887540412;yes;0.00;0;;no
'6806814032136;CONAD EMMECI;di Luca Ragaini;l.ragaini@emmecirimini.it;yes;EMMECI SRL;Via Caduti di Nassiriya 20;'04165020407;Rimini;RN;IT;47924;'+39 348 7079979;;no;2213.55;2;;no
'6813988847880;IL CORNICIAO;di Federica Santolamazza;info.ilcorniciaio@gmail.com;yes;Il corniciaio di santolamazza federica;C.so mazzini 81;'02287140426;Arcevia;AN;IT;60011;'3480588398;'+393480588398;no;470.70;1;;no
'6823150420232;FASHION GROUP;Group S.R.L di Deborah Quacquarelli;visualeventswedding@gmail.com;yes;Fashion Group S.R.L;Via firenzer 43;'07349030721;Andria;BT;IT;76123;'+39 380 755 6046;;no;474.00;1;;no
'6836443480328;GIARGERI L. & C.;di Erica Giargeri;ericagiargeri@gmail.com;yes;GIARGERI L. & C. s.n.c.;Via nazionale 58/60;'02769400876;CAMPOROTONDO ETNEO;CT;IT;95040;'3496878610;;no;367.00;1;;no
'6868376748296;CELIENTO CASA & CADEAUX;di Candida Celiento;ufficioacquisti@candidaceliento.it;yes;F. & C. CELIENTO GIFTWARE S.R.L. ;Maddaloni;'05552331216;Maddaloni;CE;IT;81024;'+393479842319;;no;1841.00;5;;no
'6998145237256;MILLENIUM BOMBONIERE;di Giuliano Piscopo;milleniumarticoli@libero.it;yes;Millenium;Corso San Giovanni a Teduccio 167;;Napoli;NA;IT;80146;'333 234 6627;'+393332346627;yes;5223.00;11;"P.IVA
IT08740391217

SDI
SUBM70N";no
'7021168984328;BELLOPEDE HOME DESIGN;di Gina Volpicelli;homedesignbellopede@gmail.com;yes;Home design bellopede;Viale Fratelli Kennedy 78;;Marcianise;CE;IT;81020;'+393287773722;'+393287773722;yes;1090.00;4;"P.IVA 04397310618

SDI J6URRTW";no
'7026136219912;PICCOLI SOGNI;di Valentina Ragosa;valentinaragosa7880@libero.it;yes;PICCOLI SOGNI s.r.l;Via Nazionale delle Puglie 17;;San Vitaliano;NA;IT;80030;'+393336514812;'+393336514812;yes;374.50;1;P.IVA 10245451215 SDIKRRH6B9;no
'7027621560584;FAVEURS DEL MARIAGE;di Rita Caruso;margherita-caruso@libero.it;yes;Faveurs del Mariage ;Viale Europa 107;;Aversa;CE;IT;81031;'+393281410115;'+393281410115;yes;369.00;1;P.IVA 04193180611          PEC. carusorita1@pec.it;no
'7027729498376;VANIA BOMBENIRE / SCALA GRETA;di Vania;greta.scala@virgilio.it;yes;;Via Benedetto Cairoli 102;;Napoli;NA;IT;80139;'+393920311616;'+393920311616;yes;6006.00;9;P.IVA 086943210   PEC. scalagreta@pec.it;no
'7032175952136;LAROOM HOME DESIGN;di Gaetano Riccio;gaetriccio1986@libero.it;yes;Laroom home design ;Via Gustavo Origlia 1;;Nocera Inferiore;SA;IT;84014;'+393281286208;'+393281286208;yes;2919.00;13;"P.IVA 06041800654

 SDI- KRRH6B9";no
'7036019736840;GHEELE;di Elena Ghergheloaia;elybusu@yahoo.it;yes;GHEELE;Borgo Sant'Antonio 15;;Pordenone;PN;IT;33170;'+393280857989;'+393280857989;yes;927.00;2;P.iva 01938360938   SDI - 2LCMINU;no
'7037778329864;DAFFY D'ART;di Angela;daffydartcollection@gmail.com;yes;daffy dart;Piazza Giacomo Matteotti 25;;Desenzano del Garda;BS;IT;25015;'+393773475107;'+393773475107;yes;3309.50;7;;no
'7057650188552;DELL'ANNO BOMBONIERE;di Mimmo Dell' Anno;dellannobomboniere@gmail.com;no;Dell'abnno bombobniere;Via San Paolino 7;;Nola;NA;IT;80035;'+393203146021;'+393203146021;no;347.00;1;"P.iva  00292191210
Pec dellanno.pasqualina@arubapec.it";no
'7057794924808;ESPOSITO BOMBONIERE;di Fabio Esposito;fabioesposito208@gmail.com;yes;ESPOSITO FABIO;Afragola;;Afragola;NA;IT;80021;'+393342028043;'+393342028043;no;1610.00;2;P.IVA 09947531217;no
'7070657347848;Giovanni;D'auria;giovanni3110@outlook.it;yes;SOTRE CAMPANIA;Corso Umberto 220;;Caivano;NA;IT;80023;'+393342336833;'+393342336833;yes;10828.90;30;"RAPPRESENTANTE - CAMPANIA
";no
'7075478110472;LES CADEAUX DE MARILENA;di Marilena Ippolito;;no;LES CADEAUX DE MARILENA;Viale J. F. Kennedy 124;;Trinitapoli;BT;IT;76015;'+393298851483;;no;398.00;1;;no
'7078690095368;RICORDI;BOMBONIERE;ricordi.bomboniere@libero.it;yes;Ricordi Bomboniere;Via San Giorgio 2;;Volla;NA;IT;80040;;;no;849.00;5;p iva 08000281215;no
'7078693372168;FINE HOUSE;BOMBONIERE;info@finehousebomboniere.it;yes;Fine House Bomboniere;Corso Umberto I 1;;Villa Literno;CE;IT;81039;;'+390818929117;no;884.00;6;p.iva 04298160617;no
'7078695797000;PANTA REI;EVENTI;pantareieventi@libero.it;yes;Panta Rei Eventi;Via Francesco Cilea 179;;Napoli;NA;IT;80127;;;no;415.00;1;"p.iva 09869721218 
cod. uni. KRH6B9";no
'7078698713352;ETHERNA S.R.L.S;'- ELEGANCE di Serena Spena;serenabomboniere@virgilio.it;yes;ETHERNA S.R.L.S - Elegance by Serena;Via Vicinale Pignatiello 3;;Napoli;NA;IT;80126;;;no;1419.00;14;Cliente Giovanni D'Auria;no
'7078702776584;ZETA;HOME;paolo.zobi@libero.it;no;Zeta Home;Via Giacinto Diano 3;;Pozzuoli;NA;IT;80078;;;no;420.00;1;"p.iva 08397941215 
cod. uni. BA6ET11";no
'7078791545096;SPIRITO;ITALIANO;;no;Spirito Italiano;Via Cosimo Pisonio 60;;Monopoli;BA;IT;70043;;;no;622.00;2;;no
'7078809927944;CLEDO;OGGETTISTICA;oggettisticacledo@virgilio.it;yes;Cledo Oggettistica;Via Napoli 22;;Andria;BT;IT;76123;;;no;3936.00;6;"p.iva 07152990722
cod. uni. M5UXCR1";no
'7088988291336;ULLALLA’ EVENTI;di Eva Emmolo;alessandramezzasalma@live.it;yes;ULLALLA’ EVENTI ;Corso Vittorio Emanuele 283;;Comiso;RG;IT;97013;'+393313213141;;no;470.00;1;;yes
'7091054477576;FIORENTINO HOME;Anna Fiorentino;annafiorentino@live.it;yes;FIORENTINO HOME;Via Nuova Toscanella 100;;Napoli;NA;IT;80145;;;no;902.00;4;P.IVA 07853051212;no
'7092024901896;EMOZIONI;di Vanessa Ferrone;giuseppe.emozioni@gmail.com;yes;EMOZIONI di Ferrone Vanessa;Via Porta Foggia 53;;Lucera;FG;IT;71036;;;no;424.00;1;"P.IVA 03688510712
pec.  emozionidiferronev@pec.it
C.F.   FRRVSS86C66A944S";no
'7092028047624;CONCETTA CREAZIONI;di Giuseppe Tarantini;info@concettacreazioni.it;yes;Concetta Creazioni;Via Mangione 1;;Corato;BA;IT;70033;;'+393408642252;no;424.00;1;"C.F. TRNGPP75E20A883N
P. Iva 05012770722
Codice destinatario: KGVVJ2H";no
'7093709963528;FLAIR;HOME;;no;FLAIR HOME;Via Roma 109;;Bellizzi;SA;IT;84092;;;no;424.00;1;P.iva 04046520658;no
'7095072784648;GIOIE E GIOIELLI;GIOIELLERIA;mallardomaria@libero.it;no;Gioielleria gioie e gioielli srl;Via Aniello Palumbo 55;;Giugliano in Campania;NA;IT;80014;;;no;434.00;1;P.iva 06200011218;no
'7099166228744;GIORNI LIETI;di Antonietta Tatulli;antoniettatatulli@gmail.com;no;GIORNI LIETI DI TATULLI;Via Giovanni Cozzoli 9;;Molfetta;BA;IT;70056;;;no;526.00;2;;no
'7100343419144;ART FLOWERS;di Michele Lanave;artflowers.bari@gmail.com;no;ART FLOWERS di Lanave Michele;Via Napoli 306;;Bari;BA;IT;70123;;;no;1159.00;2;"P.iva 08613850729
c.uni. M5UXCR1
pec. artflowers@pec.it";no
'7100629877000;ARTEGO;di Michele Scannicchio;michelescannicchio@live.it;yes;ARTEGO;Via Dante Alighieri 219;;Bari;BA;IT;70122;'+390805289174;'+390805289174;no;439.00;1;"P.iva 06565410724
c.uni. W7YVJK9";no
'7119609463048;GLASS;OGGETTISTICA;abbaticchio.maria@libero.it;yes;GLASS ;Via della Repubblica Italiana 69;;Bitonto;BA;IT;70032;'+390803714966;;no;583.00;2;;yes
'7158398189832;VISCARDI BOMBONIERE;;marycarol@gmail.com;no;Viscardi Bomboniere ;Via Alessandro Manzoni 101;;Scafati;SA;IT;84018;'+390812359804;'+390812359804;no;439.00;1;;no
'7162721665288;RARITA';di Inchingolo Melania;melania@rarita.it;no;Rarità di Inchingolo Melania;Via Felice Cavallotti 35;;Andria;BT;IT;76123;'+393315258973;'+393315258973;no;1543.50;10;"P.IVA 04395270723
SDI: M5UXXCR1";no
'7162726252808;MASTER;GROUP;mastergroup.2013@libero.it;no;Master Group srl;Corso Umberto I 317;;Casalnuovo di Napoli;NA;IT;80013;'+390818423316;'+393297033652;no;678.00;3;"P.IVA 07618451210

SDI: BA6ET11";no
'7173698519304;TOUCHE' MAISON;di Ferriero Simmaco;touche.ferriero@alice.it;yes;Touchè Maison di Ferriero Simmaco;Via Francesco Maria Pratilli;;Santa Maria Capua Vetere;CE;IT;81055;'+393249047188;;no;722.00;3;;no
'7202163360008;DIVINA;di Boccino Antonietta;;no;Divina di boccino Antonietta ;Via Acquedotto 135;;Teverola;CE;IT;81030;'+3908119525101;;no;424.00;1;P.IVA 03945390619;no
'7213991002376;GVM HOME DESIGN;di Simona Fallica;gvm.artedesign@gmail.com;yes;GVM home disign;Via Catania 373;;Adrano;CT;IT;95031;'+393928178100;'+393928178100;no;424.00;1;p.iva 05648460870.   cu x2ph38;no
'7214007189768;LE CHICCE DI LOLLY;di Jessica Gianotti;lechicchedilolly@gmail.com;yes;Le chicche di Lolly;Corso Giuseppe Garibaldi 93;;Fossombrone;PU;IT;61034;'+393895425792;'+393895425792;no;434.00;1;p.iva 02791600410.   cu SUBM70N;no
'7222594568456;CELIENTO;Caivano;info@celientobomboniere.it;yes;Celiento;Via Roma 1;;Caivano;NA;IT;80023;'+39 081 831 4660;;no;3710.00;7;;no
'7224263639304;BARBATO ARREDAMENTI;di Anna Barbato;barbato.oggettistica@gmail.com;yes;Barbato Arredamenti;Via Arenaccia 253;;Napoli;NA;IT;80141;'+393477151796;'+393477151796;yes;1791.00;6;;no
'7229911138568;EVENTI;CERIGNOLA;eventi.cerignola@gmail.com;yes;Eventi Cerignola;Viale di Levante 13;;Cerignola;FG;IT;71042;'+390885428362;;no;728.00;2;;yes
'7231776162056;Luchetti;luca Augusto;lukacina@hotmail.it;no;;;;;;;;;;no;0.00;0;;no
'7234768634120;REGALI CARILLO;BAIANO;;no;REGALI CARILLO BAIANO;Via Liberta' 37;;baiano;AV;IT;83022;;;no;616.00;2;P.iva: 03687131213;no
'7234791604488;MARINA CREAZIONI;di Peluso Maria;;no;Marina Creazioni ;Corso Italia 186;;Saviano;NA;IT;80039;'+393347648106;;no;439.00;1;P. Iva: 08049821211;no
'7248855466248;FRANCESCA;RUSCONI;;no;;;;;AG;IT;;;;no;0.00;0;;no
'7256352129288;FOREVER;di Carmela Alterio;foreverdialterio2011@gmail.com;yes;Forever di Alterio Carmela;Via Ferrovia 10;;San Gennaro Vesuviano;NA;IT;80040;'+39 081 528 6456;;no;583.00;2;;no
'7256570921224;REGALI CARILLO SARNO;di Luigi Carillo;;no;Regali carillo sas di carillo luigi ;Via Roma 93;;Sarno;SA;IT;84087;;;no;439.00;1;;no
'7256591565064;ACQUAMARE BOMBONIERE;di A. Paravento;;no;Acquamare bomboniere di paravento a.;Corso Vittorio Emanuele 91/93;;Torre del Greco;NA;IT;80059;;;no;434.00;1;;no
'7261070360840;PRANDINI;JACOPO;;no;;;;;AG;IT;;;;no;918.00;1;;no
'7261087465736;RESPACE;di Donatella Giovine;donatella@respace.it;yes;REspace Srl;Ss 36 km 23.50;;Verano Brianza;MB;IT;20843;'+390362803716;'+393886834172;yes;412.80;1;;no
'7264739164424;Gioelleria Rusconi;;;no;;;;;AG;IT;;;;no;0.00;0;;no
'7265375813896;MAMAPI;GROUP SRL;;no;Negozio Bon bon;VIA NIEVO 10;;CASTELVORTURNO;CE;IT;81030;;'+393913564655;no;601.00;2;;no
'7271782875400;WEDDING LUXURY;;;no;Wedding luxury;Viale Guglielmo Marconi 5;;Casavatore;NA;IT;80020;'+39 081 573 4287;;no;2619.00;4;;no
'7277541523720;KIRA SRLS;;kira.srl@libero.it;no;KIRA SRLS;contrada pozzo cupo  snc;;Manduria;TA;IT;74024;;;no;439.00;1;;no
'7280717070600;MOOD CONCEPT STORE;di Carlotta Vantaggioli;;no;Carlotta Vantaggioli;Viale Daniele Manin 19;;Viareggio;LU;IT;55049;;;no;439.00;1;;no
'7294651138312;ROBERTA HOME & CADEAUX;di Roberta Ruggieri;diruggeri78@gmail.com;no;ROBERTA HOME & CADEAUX;Via Giacomo Matteotti 78/80;;Foggia;FG;IT;71121;;;no;439.00;1;;yes
'7320420745480;L'ARCOLAIO;SRL;;no;L'arcolaio srl ;Via Ausonia km 4;;Pignataro Interamna;FR;IT;'03040;;;no;2423.00;4;;no
'7322232422664;SATE';;;no;SATE' Di Cristofaro Anna;Via Strauss 39;;Frattaminore;NA;IT;80020;'+393393026953;;no;689.00;3;;no
'7344632791304;NEW PORT SRL;;newportsrl@pec.buffetti.it;no;NEW PORT SRL;Piazza Angelo Zanelli 18;;Salò;BS;IT;25087;;;no;3490.00;2;;no
'7386589757704;GIOIELLERIA;PAGANO;;no;;;;;AG;IT;;;;no;290.00;1;;no
'7386621477128;DECO’;di Cinzia L’Abbate;;no;;Via Donato Jaia 8;;Conversano;BA;IT;70014;;;no;183.00;1;;no
'7386882048264;PRESTIGE;;;no;P.IVA 03738030653;Via Giovan Battista Castaldo 55;;Nocera Inferiore;SA;IT;84014;;;no;439.00;1;;no
'7411752632584;FLOWER DESIGN;di Michela De Marco;;no;Michela De Marco;Via Antonello da Messina snc;;Diamante;CS;IT;87023;;;no;480.00;2;;no
'7446465184008;MP EVENT CREATOR;di  Maurizio Porricelli;mauro.1989@me.com;no;MP EVENT CREATOR;Corso Vittorio Emanuele II 3;;Acerra;NA;IT;80011;'351 572 4017;'+393515724017;no;460.00;1;;no
'7446757703944;AMA DESIGN GALLERY;di Alfredo Sestile;amadesigngallery@libero.it;no;AMA DESIGN GALLERY SRLS;Via Giuseppe di Vittorio 46/48;;Giugliano in Campania;NA;IT;80014;'+393357836571;;no;235.00;1;;no
'7587826893064;C.A. GROSS;DI CROCE ANGELA;cacroceangela@pec.it;no;C.A. GROSS ;Via Avvocato Enrico de Nicola 12;;Trani;BT;IT;76125;;;no;437.00;1;;no
'7590487949576;LA VIE EN ROSE;di Anna Petito;;no;LA VIE EN ROSE;Via Monte Rosa 116;;Napoli;NA;IT;80144;'+393349192707;;no;532.28;1;;no
'7625364766984;NEW LIFE SRL;;;no;;Via Alcide de Gasperi 35;;marano;NA;IT;80016;;;no;0.00;0;;no
'7632818569480;IL FILO DI SETA;di Laura Ripamonti;ilfilodiseta@pec.com;no;Il filo di seta;Via Italia 2;P.IVA 07570740964;Bellusco;MB;IT;20882;'+393498870138;;no;1012.00;3;;no
'7671948640520;OK TIME;di  Gaetano Cennamo;oktime@pec.it;yes;Ok Time;Via Provinciale Fratta Crispano 65;P.iva 03899831212. C.F. CNNGTN80P27F839E;Crispano;NA;IT;80020;;;no;408.00;3;;no
'7674715078920;GOLINO HOME DESIGN;di Veronica Golino;golino_homedesign@virglio.it;no;Golino home design;Via Lecce 57;;Marcianise;CE;IT;81025;'+393204507412;;no;3576.00;13;;no
'7691433804040;GIOIELLERIA MANGIAPIA;;;no;Gioielleria Mangiapia;Via San Donato 64d;;Napoli;NA;IT;80126;'+39 338 494 3935;;no;203.00;1;;no
'7714282668296;CARPE DIEM;di Guenda;carpediemriccione2@gmail.com;yes;CARPE DIEM;Viale Dante 170A;;Riccione;RN;IT;47838;'+390541649013;'+393464901949;yes;1172.00;5;;no
'7749460459784;NICLA HOME & CO;di Nicla La Carpia;nicla-lacarpia@hotmail.it;yes;Nicla Home&Co;Viale G. Mazzini 78;;Ferrandina;MT;IT;75013;'+3908351972199;;no;472.00;1;;no
'7762785009928;LES PERLES DU MONDE;di Rosa;lesperlesdumonde@hotmail.it;yes;Les Perles du Monde;Via Bologna 2;;Cerignola;FG;IT;71042;;'+390885411030;yes;33.00;2;;no
'7763301597448;TULINO HOME;di Stefania Tulino;;no;Tulino Home;Corso E. de Nicola 4;;Afragola;NA;IT;80021;'+3908118814273;;no;40.00;2;"P.IVA  08902171217

X2PH38J";no
'7798826500360;SPIRITO LIBERO;di Tazio Peschera;tazio@spiritolibero.ch;yes;Spirito Libero;Via Francesco Borromini 18;;Lugano;;CH;6900;'+41794262873;'+41794262873;no;2021.07;10;IVA :   CHE-114.771.765;no
'7801398952200;GIFT 42;di Giorgia Santini;gift42rimini@gmail.com;yes;Gift 42;Corso d'Augusto 42;;Rimini;RN;IT;47921;'+39054124912;'+39054124912;no;1313.84;4;P.IVA 04442360402     cod.u. M5UXCR1;no
'7812747395336;SWAN Cosmetic-Studios Parfümerie;di Monika Reitberger;office@swan-parfuemerie.de;no;SWAN Cosmetic-Studios Parfümerie;Stadtplatz 29;;Eggenfelden;;DE;84307;;;no;0.00;0;International Vat-Number: DE157104492;no
'7848335966472;LA CASA DI BETTY;di Andrea Cembalo;info@casadibetty.it;yes;LA CASADI BETTY;Via Roma 63A;;Battipaglia;SA;IT;84091;'+393312595172;;no;1089.00;4;;no
'7887913484552;Valeria;Aubry;;no;;Via Campegna 133;Isolato 1 piano 5;Napoli;NA;IT;80124;;;no;0.00;0;;no
'7898770407688;LATINI 2.0 Srls;;info@latinicasa.it;yes;LATINI 2.0 Srls;Largo Igino Garbini 4;;Viterbo;VT;IT;'01100;'+390761332048;;no;0.00;0;"P.IVA 02341720569
SUBM70N";no
'7901493297416;ANNA TAMMARO WEDDING;di Anna Tammaro;annatammarowedding@gmail.com;yes;ANNA TAMMARO WEDDING ;Via San Francesco a Patria 49;Parco Teresa;Giugliano in Campania;NA;IT;80018;'+390818189268;'+393334691546;no;0.00;0;p.iva 07816801216;no
'7930012074248;SISTEMA REGALI;di Clementoni Mariella;;no;Sistema Regali di Clementoni Mariella;Via Roma 271;;Martinsicuro;TE;IT;64014;'+390861797613;;no;0.00;0;P.IVA  00887740678  ---   C.F. CLMMLL59B53C901Q;no
'7930687160584;CHICCA CONFETTI;di Francesca Di Stefano;chiccaconfetti@tiscali.it;yes;CHICCA CONFETTI di Francesca Di Stefano;Via Sant'Anna 160;;Ragusa;RG;IT;97100;'+393888894653;;no;0.00;0;P.IVA  01393130883  --- cod.u.  KRRH6B9;no
'7956515324168;LE GIOIE MAISON;di Domenico Carbone;legioiemaison@gmail.com;yes;LE GIOIE MAISON di Adele Carmen Sergi;Via Umberto I 267;A;Delianuova;RC;IT;89012;'+393398255840;'+393398255840;no;424.00;1;"P.IVA 0314805804
C.U.  M5UXCR1";no
'7957093908744;MCS LUXURY;Caterina Stipo;katesansanelli@gmail.com;yes;MCS LUXURY di Domenico Stipo;Via Petrarella 2;;Sant'Arcangelo;PZ;IT;85037;'+393404738320;'+393404738320;no;424.00;1;"P.IVA 01661490761
C.U. M5UXCR1";no
'7971796353288;Tabacchi Lucia;Sansone;sansone.lucia@virgilio.it;yes;Tabacchi Lucia Sansone riv. 274;Via Ottaviano 75;;Roma;RM;IT;'00192;'+393472942908;'+393472942908;no;426.00;1;"p.iva 16377271008
cod.ide. 5RUO820";no
'7991613915400;STAGE 12;di Antonio Cimmino;store@jfcgroup.ch;yes;Stage12;Corso Enrico Pestalozzi 12;;Lugano;;CH;6900;'+41912226296;'+41912226296;yes;64.00;2;;no
'8039852245256;KYOOTE INFINITY BEAUTY;di Silvia Mantovani;;no;KYOOTE INFINITY BEAUTY di Silvia Mantovani;Piazza Palmiro Togliatti 35;;Goro;FE;IT;44020;'+393343166442;;no;0.00;0;"P.IVA 02047070384
---- COD F. MNTSLV91T45G916C";no
'8071192477960;ANTONICELLI STORE;di Antonicelli Franco;regali.antonicelli@libero.it;no;ANTONICELLI STORE;Corso Gramsci 64;;Palagianello;TA;IT;74123;'+390998494058;'+393480525566;no;0.00;0;IVA 01871220735;no
'8084388872456;SABOTINO 50 / DATURA';di Fabio Mazzocchi;profox@tin.it;yes;DATURA' SRL;Via Sabotino 50;;Roma;RM;IT;'00195;'+393346687747;'+393346687747;no;0.00;0;P.IVA  01019561008    ------   COD U. M5UXCR1;no
'8102879756552;INTERNO 63 / PHOTO SERVICE;di Nicole Forzi;interno63@libero.it;yes;INTERNO 63 / PHOTO SERVICE di Nicole Forzi;Via Ezio Vanoni 29;;Morbegno;SO;IT;23017;'+393473122030;'+393473122030;yes;199.00;3;P.IVA 00570860148 ---- COD.U.  SUBM70N;no
'8163959669000;FABRIK;di Martino Orlando e Amato Fabio;fabriksanremo@gmail.com;no;FABRIK;Via Roma 32;;Sanremo;IM;IT;18038;'+393294212846;;no;0.00;0;;no
'8167529971976;LA GARDENIA SRL;di Gennaro Iorizo;infolagardenia@gmail.com;yes;LA GARDENIA SRL;Contrada Torana;;Ariano Irpino;AV;IT;83031;'+393335299662;'+393335299662;no;0.00;0;P.IVA 02928620646 ---- C.U. J6URRTW;no
'8175324463368;LE BRICIOLE CORNICI;di Sare Bertolini;lebriciolecornici@gmail.com;yes;LE BRICIOLE CORNICI di Sare Bertolini;Via XX Settembre 20;;Bientina;PI;IT;56031;'+393391125239;;no;75.00;1;;no
'8225664696584;Fiorista;Russo Francesco;;no;P.iva 03720361215   SDI: M5UXCR1;Via Roma 16;;Vico Equense;NA;IT;80069;;;no;0.00;0;;no
'8231800504584;Fiorista;Russo Francesco;;no;P.iva 03720361215    C.U. M5UXCR1;Via Roma 16;;Vico Equense;NA;IT;80069;;;no;0.00;0;;no
'8256131432712;PESCIPAVIA;di Luca Pesci;luca@pesci.it;no;SILIO PESCI;Strada Nuova 78;;Pavia;PV;IT;27100;'+393356081593;'+393356081593;no;0.00;0;;no
'8257665597704;CLAVIAN;di Claudia Masi;info@clavian.it;yes;P.IVA 05242681210;Via Diego Colamarino 50;;Torre del Greco;NA;IT;80059;'+393334461048;'+393334461048;no;0.00;0;;no
'8258330427656;MOMENTI DA VIVERE / PROGETTO BAGNO SNC;di Roberta Lucheroni;info@momentidavivere.com;yes;PROGETTO BAGNO SNC;Via Piana 17;;Castiglione del Lago;PG;IT;'06061;;'+39339140331;yes;0.00;0;;no
'8258372993288;LE PERLE DI GIORGIA;di Giorgia Pantini;pantinigiorgia@hotmail.it;yes;P.IVA 15587241009;Via Sublacense 116;;Madonna della Pace;RM;IT;'00020;;'+393343415126;yes;25.00;1;;no
'8260937548040;BOTANICA;di Deborah Di Bari;deb.dibari@libero.it;yes;;Corso Giuseppe Garibaldi 82;;Terlizzi;BA;IT;70038;'+393476077802;'+393476077802;yes;63.00;9;;no
'8261239734536;LA DOLCE VITA;di Nerina Aloiso;;no;;Via Duca Degli Abruzzi 58;;Catania;CT;IT;95127;;'+393343644813;no;0.00;0;;no
'8261796069640;ABRACADABRA Bari;di Lemar srl;info@abracadabrabari.it;no;;Viale del Concilio Vaticano II 93;;Bari;BA;IT;70124;'+393491235969;;no;0.00;0;;no
'8262250430728;CASA MAGIC LUXURY;di Carmen;ferdinandoscudieri1993@gmail.com;yes;CASA MAGIC DISTRIBUZIONI SRL;Via Piave 6;;Sarno;SA;IT;84087;'+393662456295;'+393662456295;no;0.00;0;;no
'8267249058056;DUE CIVETTE SUL COMO';di Angela Barbieri;duecivette@libero.it;yes;;Viale Martiri del 1799 71;;Altamura;BA;IT;70022;'+393391531051;'+393391531051;no;153.00;1;;no
'8267374690568;PICCOLO FIORE;di Marzia e Laura;info@piccolofiore.it;yes;PICCOLO FIORE di Marzia e Laura;Via Broseta 101;;Bergamo;BG;IT;24128;'+393483703384;;no;0.00;0;;no
'8267441340680;P.R. DAL 1959;DI MARIO RAGONESE;;no;;Via Procida 72;;San Mauro Castelverde;PA;IT;90010;'+393349159392;;no;0.00;0;;no
'8267481252104;MAGNOLIA / DEL PRETE ANGELA;di Nunzia;;no;DEL PRETE ANGELA ;Via Francesco Crispi 13;;Quarto;NA;IT;80010;'+393203522744;'+393203522744;no;0.00;0;;no
'8267496259848;PICCHIRO' INTERIOR HOUSE;di Gaetano;;no;;Via Variante 7 bis 37;;Castello di Cisterna;NA;IT;80030;'+393512457465;'+393735146246;no;0.00;0;;no
'8271228829960;CAL.MAR SRLS;;calmarsrls@gmail.com;yes;CAL.MAR SRLS;Via per Montemesola Km 10;;Taranto;TA;IT;74123;'+393470540822;;no;0.00;0;;yes
'8272991846664;PETER SRL;di Ornella;peter.bomboniere@gmail.com;yes;PETER SRL;Via G. Boccaccio 4;;Grumo Nevano;NA;IT;80028;'+393335793434;;no;0.00;0;;yes
'8273035690248;ATMOSPHERE / OBJECTS HOME SRLS;;atmosphere.venosa@alice.it;yes;OBJECTS HOME SRLS;Via Appia 16;;Venosa;PZ;IT;85029;'+393395946586;;no;0.00;0;;yes
'8273069736200;IDEA CASA;di Anna del Verme;ideacasa2012@yahoo.it;yes;IDEA CASA;Via Ferruccio Parri;;Vallo della Lucania;SA;IT;84078;'+393343565869;'+390974712289;no;42.00;1;;no
'8273103290632;GIANCARLO;BELCASTRO;info@belcastroforniture.it;no;;;;;AG;IT;;;;no;0.00;0;;no
'8273105191176;BELCASTRO FORNITURE;di Giancarlo Belcastro;info2@belcastroforniture.it;yes;BELCASTRO FORNITURE di Giancarlo Belcastro;Strada Santa Finis;;Marina di Gioiosa Ionica;RC;IT;89046;'+390964415317;;no;0.00;0;;yes
'8273144447240;PAGANO HOME;di Pina Pagano;pina.91@hotmail.it;yes;PAGANO HOME di Pina Pagano;Via Acquaro;;San Cipriano d'Aversa;CE;IT;81036;'+393314532838;;no;30.00;1;;yes
'8273200578824;EVENT CREATOR;di Antonella Varricchio;antonellavarricchio@gmail.com;yes;EVENT CREATOR di Antonella Varricchio;Via Salvator Rosa 29;;Benevento;BN;IT;82100;'+393484020419;;no;0.00;0;;yes
'8273235607816;METALFLOR;di Daniela;;no;METALFLOR di Moriconi Elia;Sant'Egidio alla Vibrata;;Sant'Egidio alla Vibrata;TE;IT;64016;'+393389233590;;no;0.00;0;;no
'8273418682632;IL FIOCCO;di Anna Gammaria;ilfioccopotenza@gmail.com;yes;IL FIOCCO di Anna Gammaria;Potenza;;Potenza;PZ;IT;85100;'+393450479915;;no;0.00;0;;yes
'8273443979528;NOVITA';di Manna Giuseppina;pina_manna68@yahoo.it;yes;NOVITÀ;Arzano;;Arzano;NA;IT;80022;'+390810400432;;no;0.00;0;;yes
'8273477107976;IDEA;di Anna Dambruoso;annadambruoso9@gmail.com;yes;IDEA di Anna Dambruoso;Via Benedetto Petrone 32;;Noci;BA;IT;70015;'+393201528638;;no;0.00;0;;yes
'8273510826248;CASA IN;di Carmela Giampalmo;casain1969marcella@gmail.com;yes;CASA IN di Carmela Giampalmo;Via della Repubblica Italiana 111;;Bitonto;BA;IT;70032;'+393282346117;'+39080375239;yes;311.00;5;;yes
'8273532158216;COME D'INCANTO;di Viviana Cipriani;ciprianiviviana@yahoo.it;yes;COME D'INCANTO;Via Armando Diaz 16;PALESE - MACCHIE;Bari;BA;IT;70128;'+3932765544226;'+3932765544226;no;80.00;2;;yes
'8276417741064;SPEEDY SWEET FLOWERS;Di Luana Lorenza Rastellini;Speedysweetflower@gmail.com;yes;SPEEDY SWEET FLOWERS;Via Metella Nuova 16;;Garrufo;TE;IT;64027;'+393895591255;'+390861887633;yes;12.00;1;;no
'8276553990408;MAGICHE MAGIE;;;no;MAGICHE MAGIE;Via Alessandro Scarlatti 150;;Napoli;NA;IT;80129;'+3908118677705;;no;0.00;0;;no
'8281847005448;LIGHT DESIGN;di Carlo Proietti;carloproietti@light-design.it;yes;LIGHT & DESIGN;Via Cintia 108;;Rieti;RI;IT;'02100;'+393271706126;;no;0.00;0;;yes
'8323596878088;MAISON CHIC;di Miriam Abagnale;maisonchic.castellammare@gmail.com;yes;MAISON CHIC;Via Roma 71B;;Castellammare di Stabia;NA;IT;80053;'+390813791810;;no;26.00;2;;no
'8337518592264;GRECO HOME;di Michele Greco;grecomike@libero.it;yes;GRECO HOME SRL;Strada Ponte della Persica 151;;Castellammare di Stabia;NA;IT;80053;'+393931967378;;no;0.00;0;;no
'8345792348424;MAVIE RUSSO DECOR;di Paola Cacace;paolacacace2018@gmail.com;no;MAVIE RUSSO DECOR;Via Ferdinando Galiani 12;;Napoli;NA;IT;80122;'+393934362513;'+393934362513;no;0.00;0;;no
'8418582823176;FATTI PER BRILLARE;di Tiziana Belmonte;tizianabelmonte80@gmail.com;yes;FATTI PER BRILLARE;Cozzo Carbonaro, via orecchiella 14;;Cozzo Carbonaro;CS;IT;87010;'+393891385632;;no;0.00;0;;no
'8448380305672;LR PARTNERS;LR PARTNERS;;no;;;;;;IT;;;;no;0.00;0;;no
'8610535407880;PIRICO OGGETTISTICA;di Teresa Carbone;piricopartyingross12@libero.it;yes;PIRICO OGGETTISTICA;Via Monsignor F. P. Calamita 11;;Bitonto;BA;IT;70032;'+390804167401;'+393314179952;yes;58.00;2;;no
'8627574079752;VA.LO.RE;di Giarola Daniela;valore.snc7260@gmail.com;yes;VA.LO.RE;Corso della Repubblica 276;;Cisterna di Latina;LT;IT;'04012;'+393898973187;;no;30.00;1;;no
'9308263121160;L'ALBERO CAPOVOLTO;di Valeria Ivella;lalberocapovolto@gmail.com;yes;;Corso Giuseppe Mazzini 8;;Campobasso;CB;IT;86100;'+393883678210;'+393883678210;yes;58.00;3;p.IVA 01746860707  -- M5UXCR1;no
'9376113262856;NAIL ONE BEAUTY COMPANY;di Francesca Torricelli;nailbeatycompany@gmail.com;yes;nail one beauty company;Via Amsterdam 130;;Roma;RM;IT;'00144;'+393402913588;;no;27.00;1;;no
'9671442104584;ESSENZA;di Mezzaqui Manuela;manu.essenza@icloud.com;yes;ESSENZA di Mezzaqui Manuela ;Largo Carlo Alberto dalla Chiesa 33;;Pavullo Nel Frignano;MO;IT;41026;'+393405003138;'+393405003138;yes;28.00;1;;no
'11216441049352;Coming Out Srl;;comingoutshop.colosseo@gmail.com;yes;Coming Out Srl;Via di San Giovanni in Laterano 8;;Roma;RM;IT;'00184;'+393478390013;;no;38.00;1;;yes
'11875621601544;Arc Domus;Di Valerio Vergallo;info@arcdomus.it;yes;Arc Domus;Via Niccolò Tommaso d'Aquino 77;;Taranto;TA;IT;74123;'+39 099 5339956;'+393452283369;yes;40.00;1;P.IVA 01861560736;no`;

        const lines = csvData.split(/\n(?=')/);
        
        // Load all existing for fast lookup
        const crmCustomers = await prisma.customer.findMany({ select: { email: true, phone: true } });
        const existingEmails = new Set(crmCustomers.map(c => c.email?.toLowerCase()).filter(Boolean));
        const existingPhones = new Set(crmCustomers.map(c => c.phone).filter(Boolean));

        const toCreate = [];
        let skipped = 0;

        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].replace(/^'/, '');
            const fields = line.split(';');
            if (fields.length < 5) continue;

            const firstName = fields[1] || '';
            const lastName = fields[2] || '';
            const email = fields[3]?.toLowerCase().trim() || null;
            const businessName = fields[5] || `${firstName} ${lastName}`;
            const city = fields[8] || '';
            const phone = fields[12]?.replace(/['+]/g, '').trim() || fields[13]?.replace(/['+]/g, '').trim() || '';
            const totalOrders = parseInt(fields[16]) || 0;

            if ((email && existingEmails.has(email)) || (phone && existingPhones.has(phone))) {
                skipped++;
                continue;
            }

            toCreate.push({
                firstName, lastName, businessName, email, phone, city,
                region: '',
                status: totalOrders > 0 ? 'ATTIVO' : 'INATTIVO',
                source: 'SHOPIFY_IMPORT'
            });
            
            if (email) existingEmails.add(email);
            if (phone) existingPhones.add(phone);
        }

        if (toCreate.length > 0) {
            await prisma.customer.createMany({ data: toCreate, skipDuplicates: true });
        }

        res.send(`IMPORTAZIONE INLINED COMPLETATA: +${toCreate.length} nuovi, ${skipped} saltati.`);
    } catch (e) {
        res.status(500).send("ERROR: " + e.message);
    }
});

app.get('/api/health', (req, res) => res.send('SERVER IS ONLINE'));

// INITIALIZATION ROUTE (Self-healing DB)
app.get('/api/init', async (req, res) => {
  try {
    // 1. Assicura l'enum UserRole
    await prisma.$executeRawUnsafe(`
      DO $$ BEGIN
          CREATE TYPE "UserRole" AS ENUM ('SUPER_ADMIN', 'ADMIN');
      EXCEPTION
          WHEN duplicate_object THEN null;
      END $$;
    `);

    // 2. Assicura la tabella User con i nuovi campi
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "User" (
          "id" TEXT NOT NULL,
          "email" TEXT NOT NULL,
          "password" TEXT NOT NULL,
          "firstName" TEXT,
          "lastName" TEXT,
          "role" "UserRole" NOT NULL DEFAULT 'ADMIN',
          "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "User_pkey" PRIMARY KEY ("id")
      );
    `);

    // Migrazione: se la colonna "name" esiste ancora (legacy), aggiungiamo le nuove se mancano
    try {
      await prisma.$executeRawUnsafe('ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "firstName" TEXT;');
      await prisma.$executeRawUnsafe('ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "lastName" TEXT;');
      await prisma.$executeRawUnsafe('ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "commission_rate" DOUBLE PRECISION DEFAULT 0;');
    } catch (err) {
      console.log('Colonne già presenti o errore in aggiunta:', err);
    }

    try {
      await prisma.$executeRawUnsafe('ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "commission_enabled" BOOLEAN DEFAULT true;');
      await prisma.$executeRawUnsafe('ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "discounts_json" JSONB;');
    } catch (err) {
      console.log('Colonne aggiuntive già presenti o errore:', err);
    }

    // 3. Assicura l'indice
    await prisma.$executeRawUnsafe(`
      CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email");
    `);

    const email = 'info@prettylittle.it';
    const exists = await prisma.user.findUnique({ where: { email } });
    if (!exists) {
      const hashedPassword = await bcrypt.hash('---', 10);
      await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          firstName: 'Luca',
          lastName: 'Vitale',
          role: 'SUPER_ADMIN'
        }
      });
      return res.json({ success: true, message: 'Database aggiornato e Admin Luca Vitale creato' });
    } else {
      // Aggiorna admin esistente con i campi separati se necessario
      await prisma.user.update({
        where: { email },
        data: { firstName: 'Luca', lastName: 'Vitale' }
      });
    }
    res.json({ success: true, message: 'Database già pronto con firstName/lastName' });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message, stack: e.stack });
  }
});

// MAIN API ROUTER
app.use('/api', mainRouter);

// EXPORT FOR VERCEL
module.exports = app;

