var RUTACONTROL='http://ingetrace.participa.cl/external_movil/control/control.php';
//var RUTACONTROL='http://localhost/web_ingetrace/external_movil/control/control.php';
var BD_APP=null;


var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function() {
		
		BD_APP = sqlitePlugin.openDatabase({name: "ingetrace.db", location: 2, createFromLocation: 1});
		BD_APP.transaction(function(tx) {
			tx.executeSql('CREATE TABLE IF NOT EXISTS tbl_datos (id_cliente VARCHAR (15),id_sucursal VARCHAR (4),json_sucursal TEXT)');
			tx.executeSql("select count(json_sucursal) as cnt from tbl_datos;", [], function(tx, res) {
			  if(res.rows.item(0).cnt=="0")
			  {
				  tx.executeSql("INSERT INTO tbl_datos (id_cliente, id_sucursal,json_sucursal) VALUES (?,?,?)", ["Nada","Nada", "Nada"], function(tx, res){
				  });
			  }
			});
		});
		
		app.receivedEvent('deviceready');

		var push = PushNotification.init({
			android: {
				senderID: "964841478681",
				sound: true, 
                forceShow: true,
                vibrate: true	
			},
			ios: {
				alert: true,
				badge: true,
				sound: true
			},
			windows: {}
		});

		push.on('registration', function(data) {
			// data.registrationI
			//alert(''+data.registrationId);
			RegistrarDispositivo(data.registrationId);
		});

		push.on('notification', function(data) {
			$("#H_DESDE_NOTIFICACION").val("1");
			$.each(data.additionalData, function(i, d) {
				if(""+i == "additionalData")
				{
					$("#H_ID_CLIENTE_ACTUAL").val(d.idcliente);
					$("#H_ID_SUCURSAL_ACTUAL").val(d.idsucursal);
					$("#H_ID_SENSOR").val(d.idsensor);					
				}
			});
			CargarNotificacion($("#H_ID_CLIENTE_ACTUAL").val(),$("#H_ID_SUCURSAL_ACTUAL").val(),$("#H_ID_SENSOR").val());
			//alert(data.additionalData);
			// data.message,
			// data.title,
			// data.count,
			// data.sound,
			// data.image,
			// data.additionalData
		});

		push.on('error', function(e) {
			// e.message
		});
    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {
		setTimeout(function () {
			if($("#H_DESDE_NOTIFICACION").val()!="1")
			{
				BuscarCookie();
			}
		}, 500);
    }
};
$( document ).ready(function() {
	$("#ModalErrorp1").load("html_parts/modal_MensajeError.html", function() {
		var BotonAceptar=$("#ModalErrorp1").find(".botonaceptarmodal");
		$(BotonAceptar).attr('id','btnErrorAceptarPage1');
		$(BotonAceptar).attr('onclick','javascript:CerrarModalErrorP1(event)');
	});
	$("#ModalPage1").load("html_parts/modal_cargando.html");
	
   	$("#DivIngresar").click(function(e) {
		e.preventDefault();
		ValidarCampos();
	});
	$('#txtUsuario').keypress(function(e) {
		if(e.which == 13) {
			ValidarCampos();
		}
	});
	$('#txtContrasena').keypress(function(e) {
		if(e.which == 13) {
			ValidarCampos();
		}
	});
	var origen = getUrlVars()["Origen"];
	
	if(origen=='p2')
	{
		$('#RowLogin').hide();
	}
	else if(origen=='p3')
	{
		$('#RowLogin').hide();
	}
});
function RegistrarDispositivo(ID_device)
{
	$.post('http://www.ingetrace.cl/d-external/registro_device/grabar_id.php',{
		Id_device: ID_device,
	},
	function(response) {
		if(response=="ok")
		{
			$('#H_ID_DEVICE_NOTIFICACION').val(ID_device);
		}
	}).done(function(response) {
		
	});
}
function CerrarSplash()
{
	try {
		navigator.splashscreen.hide();
	}
	catch(err) {
		alert(err.message);
	}
	
}
function setJsonSucursal(id_cliente,id_sucursal,json)
{
	var StringJson=""+btoa(json);
	
	BD_APP.transaction(function(tx) {
		var StringQuery="UPDATE tbl_datos SET id_cliente='"+id_cliente+"', id_sucursal='"+id_sucursal+"', json_sucursal='"+StringJson+"'";		
		tx.executeSql(StringQuery);
	});
}
function CargarMarquee()
{
	var marquee = $('div.marquee');
    marquee.each(function() {
		  var mar = $(this)
		  var interval = null;
		  var inter = 1000 / 60;
		  var indent = 0;
			mar.marquee = function() {
				indent--;
				mar.css('text-indent',indent);
				if (indent < -1 * mar.children('div.marquee-text').width()) {
				   indent = 0;
				   mar.css('text-indent',0);
								clearInterval(interval); 
				   setTimeout(function () {  
				   interval = setInterval(mar.marquee,inter);
				   }, 2000);

				}
		  };
		  setTimeout(function () {  
		   interval = setInterval(mar.marquee,inter);
		   }, 2000);
	  
	});
}
function getUrlVars() {
	var vars = {};
	var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
	vars[key] = value;
	});
	return vars;
}
function BuscarCookie()
{
	var ValCK=getCK();
	//Es de notificacion
	
	var UbicacionPage=''+window.location.hash;
		
		
	if(UbicacionPage=='#p2')
	{
		window.location.href = "index.html?Origen=p2";
	}
	else if(UbicacionPage=='#p3')
	{
		window.location.href = "index.html?Origen=p3";
	}
	else
	{
		if(ValCK!="undefined" && ValCK!="" && ValCK.toUpperCase()!="NULL")
		{
			ValidarCKIncial(ValCK);
		}
		else
		{
			setTimeout(function () {
				CerrarSplash();
			}, 750);
		}
	}
}
function GenerarHTMLSensores(DATOS)
{
	var TermicosVisibles=false;
	var ElectricosVisibles=false;
	
	$('#DivTemperatura').show();
	$('#DivElectrico').show();
	
	//Sensores termicos
	var HtmlTermicos='';
	
	$.each(DATOS.SENSORES_TERMICOS, function(j, e) {
		
		var NombreEquipo=e.NOMBRE_EQUIPO+'';
		var ClaseMarqueDiv='';
		var ClaseMarque='';
		
		if(NombreEquipo.length>19)
		{
			ClaseMarqueDiv='marquee';
			ClaseMarque='marquee-text';
		}
		
		TermicosVisibles=true;
		
		HtmlTermicos+='<div style="min-height: 220px" class="col-lg-6 col-md-6 colmod" id="Contenedor_'+e.ID_SENSOR+'"><div class="panel panel-red"><div class="panel-heading"><div class="row">';
		HtmlTermicos+='<div class="col-xs-1 text-left" style="padding-left: 5px; padding-right: 0px;"><span id="IconoSensor_'+e.ID_SENSOR+'">'+e.STATUS_EQUIPO+'</span></div><div class="col-xs-8 text-left '+ClaseMarqueDiv+'" style="padding-left: 5px; padding-right: 0px; top: 0px; margin-top: 0px;"><div class="'+ClaseMarque+'">'+NombreEquipo+'</div></div>';
		HtmlTermicos+='<div class="col-xs-1 text-left" id="SENAL_'+e.ID_SENSOR+'" style="padding-left: 5px; padding-right: 5px;">'+e.SENAL+'</div><div class="col-xs-2 text-right"><a id="VerSensoresRegistrados_'+e.ID_SENSOR+'" href="#" onclick="javascript:CargarGraficoSensorTermico(event,\''+e.ID_CLIENTE+'\',\''+e.RAZON_SOCIAL+'\',\''+e.ID_SUCURSAL+'\',\''+e.NOMBRE_SUCURSAL+'\',\''+e.ID_SECCION+'\',\''+e.NOMBRE_SECCION+'\',\''+e.ID_EQUIPO+'\',\''+e.NOMBRE_EQUIPO+'\',\''+e.ID_SENSOR+'\');" razon_social="'+e.RAZON_SOCIAL+'" nombre_sucursal="'+e.NOMBRE_SUCURSAL+'" id_seccion="'+e.ID_SECCION+'" nombre_seccion="'+e.NOMBRE_SECCION+'" id_equipo="'+e.ID_EQUIPO+'" nombre_equipo="'+e.NOMBRE_EQUIPO+'">';
		HtmlTermicos+='<span class="pull-right"><i class="fa fa-arrow-circle-right"></i></span><div class="clearfix"></div></a></div></div></div>';
		HtmlTermicos+='<div class="panel-body">';
		HtmlTermicos+='<div class="col-xs-4 text-center stack-order" style="padding-top: 10px;"> <h1 class="no-margins" id="TempMin_'+e.ID_SENSOR+'">'+e.MINIMA+'</h1>';
		HtmlTermicos+='<small><span id="HORA_MINIMA_'+e.ID_SENSOR+'">'+e.HORA_MINIMA+'</span><br>Mínima</small></div>';
		HtmlTermicos+='<div class="row col-with-divider"><div class="col-xs-4 text-center stack-order">';
		HtmlTermicos+=e.TEMPERATURA;
		HtmlTermicos+='<div align="center" id="Fecha_'+e.ID_SENSOR+'" style="display:none">'+e.FECHA+'</div>';
		HtmlTermicos+='<small><span id="Hora_'+e.ID_SENSOR+'">'+e.HORA+'</span><br>Actual</small></div><div class="col-xs-4 text-center stack-order">';
		HtmlTermicos+='<h1 id="TempMax_'+e.ID_SENSOR+'" class="no-margins">'+e.MAXIMA+'</h1>';
		HtmlTermicos+='<small><span id="HORA_MAXIMA_'+e.ID_SENSOR+'">'+e.HORA_MAXIMA+'</span><br>Máxima</small>';
		HtmlTermicos+='</div></div><div class="row col-with-divider"><div class="col-xs-4 text-center stack-order">';
		HtmlTermicos+='<h1 id="Cota_'+e.ID_SENSOR+'" class="no-margins">'+e.COTA+'</h1><small>Límite</small></div><div class="col-xs-8 text-center stack-order">';
		HtmlTermicos+='<h3 id="Tr_sens_'+e.ID_SENSOR+'" class="no-margins"><div align="center">'+e.ALARMA+'</div></h3>';
		HtmlTermicos+='<small>Ult. Alarma</small></div></div></div></div></div>';
	});					
	
	$("#ContenedorSensoresTermicos").html(HtmlTermicos);
						
	//Sensores Electricos
	var HtmlElectricos='';
						
	$.each(DATOS.SENSORES_ELECTRICOS, function(k, f) {
		
		ElectricosVisibles=true;
		var NombreEquipo=f.EQUIPO+'';
		var ClaseMarqueDiv='';
		var ClaseMarque='';
		if(NombreEquipo.length>16)
		{
			ClaseMarqueDiv='marquee';
			ClaseMarque='marquee-text';
		}
		
		HtmlElectricos+='<div class="col-lg-6 col-md-6 colmod" id="Contenedor_'+f.IDSENSOR+'"><div class="panel panel-red"><div class="panel-heading"><div class="row"><div class="col-xs-1 text-left" style="padding-left: 5px;">';
		HtmlElectricos+='<i class="fa fa-hdd-o fa-2x"></i></div><div class="col-xs-7 text-left '+ClaseMarqueDiv+'" style="padding-right: 0px;"><div class="'+ClaseMarque+'">'+NombreEquipo+'</div></div>';
		HtmlElectricos+='<div id="SENAL_'+f.IDSENSOR+'" class="col-xs-2 text-right">'+f.SENAL+'</div>';
		HtmlElectricos+='<div class="col-xs-1 text-right" style="padding-right: 0px;">';
		HtmlElectricos+='<a idsensor="" id="VerSensoresRegistrados" href="#" onclick="javascript:CargarGraficoSensorElectrico(event,\''+f.IDSENSOR+'\',\''+f.EQUIPO+'\');">';
		HtmlElectricos+='<span class="pull-right"><i class="fa fa-arrow-circle-right"></i></span></a></div></div></div>';
		HtmlElectricos+='<div class="panel-body"><div class="row col-with-divider"><div class="col-xs-4 text-center stack-order">';
							
		var Alarma='#08fa06';
							
		if(f.ACCION=="Open")
		{
			Alarma='#fd0002';
		}
							
		var Icono='<i style="color: '+Alarma+'" class="glyphicon glyphicon-off"></i>';
							
		HtmlElectricos+='<h1 id="Estado_'+f.IDSENSOR+'" class="no-margins">'+Icono+'</h1>';
		HtmlElectricos+='<small>Estado</small></div><div class="col-xs-8 text-center stack-order">';
		HtmlElectricos+='<h3 class="no-margins"><div id="Desde_'+f.IDSENSOR+'" align="center">'+f.FECHA_HORA+'</div></h3>';
		HtmlElectricos+='<small>Desde</small></div></div></div></div></div>';				
	});
						
	$("#ContenedorSensoresElectricos").html(HtmlElectricos);
	
	if(!TermicosVisibles)
	{
		$('#DivTemperatura').hide();
	}
	if(!ElectricosVisibles)
	{
		$('#DivElectrico').hide();
	}	
	CargarMarquee();
	$('#H_SUCURSAL_CARGADA').val("1");	
}
function VerGraficoSensorTermico(HideSplash,IdCliente,NombreCliente,IdSucursal,NombreSucursal,IdSeccion,NombreSeccion,IdEquipo,NombreEquipo,IdSensor)
{
	$(window).disablescroll();

	$('#ModalPage2').popup('open', {
		transition: 'pop'
	});
	
	var optionsLineal;
	
	$("#p3Body").html("");
	
	$("#p3Body").load(
		"sensor.html",
	function() {
			$("#RowContenidoCuerpoP3").load(
				"html_parts/modal_datosSensorTermico.html",
			function() {
				$("#H_ID_CLIENTE_ACTUAL").val(IdCliente);
				$("#H_RAZON_SOCIAL").val(NombreCliente);
				$("#H_ID_SUCURSAL_ACTUAL").val(IdSucursal);
				$("#H_ID_NOMBRE_SUCURSAL").val(NombreSucursal);
				$("#H_ID_SECCION").val(IdSeccion);
				$("#H_NOMBRE_SECCION").val(NombreSeccion);
				$("#H_ID_EQUIPO").val(IdEquipo);
				$("#H_NOMBRE_EQUIPO").val(NombreEquipo);
				$("#H_ID_SENSOR").val(IdSensor);
				
				if(HideSplash)
				{
					CerrarSplash();
				}
								
				//HTML CARGADO
				$.post(RUTACONTROL,
						{
							accion: "DatosGraficoSensorTermico",
							IdCliente: 	IdCliente,
							IdSucursal: IdSucursal,
							IdSeccion: 	IdSeccion,
							IdEquipo: 	IdEquipo,
							IdSensor:	IdSensor
						}, 
				function(response) {
					var json = jQuery.parseJSON(response);
					
					//TENDENCIA
					var CuerpoDatos='';
					var CuerpoAlarmas='';
					var IconoTendencia='';
					var DataSensor = new Array();
					var LimiteSensor = new Array();
					var PromedioSensor = new Array();
					
					$("#TituloModalGrafico").html(NombreCliente+' - '+NombreSucursal+' - '+NombreEquipo+'('+IdSensor+')');
					
					$.each(json, function(j, e) {
						//Fecha hoy				
						$("#FechaBitacoraHoy").html(e.FECHA_HOY);
						$("#inicio_filtroDatosSensor").val(e.FECHA_HOY);
						$("#termino_filtroDatosSensor").val(e.FECHA_HOY);
						
						$("#inicio_filtroDatosSensor").datepicker({
									format: "dd/mm/yyyy",
									language:"es",
									autoclose:true,
									orientation: "top auto"
									});
						
						$("#termino_filtroDatosSensor").datepicker({ format: "dd/mm/yyyy",
									language:"es",
									autoclose:true,
									orientation: "top auto"
									});
						
						$("#JSON_DATOS").html(response);
						var Promedio=0;
						var Limite=0;
						var BanderaGrafico=false;
						
						//Tabla tendencia
						$.each(e.JSON_DATOS, function(i, d) {
							//Validando TENDENCIA en Iconos
							if(!BanderaGrafico)
							{
								BanderaGrafico=true;								
								Promedio=parseFloat(d.VAR_PROMEDIO);
								Limite=parseFloat(d.LIMSUPC);
							}								
							
							var ValorSensor=parseFloat(d.TEMPERATURA);
							
							var FECHAHORA=''+d.FECHA_HORA;
							
							var anio=FECHAHORA.substring(0, 4);
							var mes =FECHAHORA.substring(5, 7);
							var dia =FECHAHORA.substring(8, 10);
							
							var hora =FECHAHORA.substring(11, 13);
							var min  =FECHAHORA.substring(14, 16);
							var seg  =FECHAHORA.substring(17, 19);
							
							if(ValorSensor == -1)
							{
								ValorSensor=0;
							}
							
							var item = [Date.UTC(parseInt(anio),parseInt(mes-1),parseInt(dia),parseInt(hora),parseInt(min),parseInt(seg)), parseFloat(ValorSensor)];
							DataSensor.push(item);
							
						});
						
						optionsLineal={
							chart: {
								zoomType: 'x',
								renderTo: 'DivGraficoLineal',
								events: {
									load: function(){
										this.myTooltip = new Highcharts.Tooltip(this, this.options.tooltip);                    
									}
								}
							},
							title: {
								text: [],
								style: {
									fontSize: '15px'
								},
								align:'left',
							},
							subtitle: {
								text:[],
								useHTML: true,
								
							},
							xAxis: {
								type: 'datetime',
								labels: {
									overflow: 'justify'
								},
								dateTimeLabelFormats: { // don't display the dummy year
									second: '%H:%M:%S'
								}
							},
							yAxis: [],
							legend: {
									enabled: false
								},
							tooltip: {
								headerFormat: '<b>{series.name}</b><br>',
								pointFormat: '{point.x:%H:%M:%S} -> {point.y:.2f} °C',
								enabled: false
							},
							credits: {
								enabled: false,
							},
							plotOptions: {
								series: {
									stickyTracking: false,
									events: {
										click: function(evt) {
											this.chart.myTooltip.refresh(evt.point, evt);
										},
										mouseOut: function() {
											this.chart.myTooltip.hide();
										}                       
									}
									
								}
							},
							series: []
						};
						
						var LineasY = {
									title: {
										text: 'T °'
									},
									plotLines: [{
										value: Promedio,
										color: 'green',
										dashStyle: 'shortdash',
										width: 2,
										label: {
											text: 'Prom.'
										}
									}, {
										value: Limite,
										color: 'red',
										dashStyle: 'Solid',
										width: 2,
										label: {
											text: 'Max.'
										}
										}]
						};
						
						optionsLineal.yAxis.push(LineasY);
						
						//Datos
						var cloneToolTip = null;
						
						var newSeriesData = {
							type: 'spline',
							name: 'Sensor',
							marker : {
								enabled : true,
								radius : 1
							},
							data: DataSensor
						};				
						optionsLineal.series.push(newSeriesData);

						
						// Render the chart
						optionsLineal.title.text.push(NombreEquipo);
					});
					$.mobile.pageContainer.pagecontainer('change', '#p3', {
						transition: 'flip',
						changeHash: true,
						reverse: true,
						showLoadMsg: false
					});
					
					//Quitando footer de jquery para que se vea el footer original
					$('#p3Body').find('.ui-footer').remove();
					//$('#p3Body').find('.ui-header').remove();

					setTimeout(function () {
						if($('#H_CARGA_SENSOR').val()=="0")
						{
							$('#H_CARGA_SENSOR').val("1");
						}
						else
						{
							$('#p3').attr('style','padding-top: 0px; padding-bottom: 0px; min-height: 395px;');
						}
					}, 250);					
				}).done(function(response) {
					$('#ModalPage2').popup("close");
					$(window).disablescroll("undo");
					setTimeout(function () {
						chart = new Highcharts.Chart(optionsLineal);
						$('#btn_buscarGrafico').prop("disabled",false);
						$("#H_TAB_GRAFICO_CARGADO").val("ok");
					}, 750);
				});
			});
	});
}
function CargarNotificacion(ID_CLIENTE,ID_SUC,ID_SENSOR)
{	
	//Verificando si hay CK
	var ValCK=getCK();
	
	if(ValCK!="undefined" && ValCK!="" && ValCK.toUpperCase()!="NULL")
	{
		//Validar si la sucursal esta cargada
		if($('#H_SUCURSAL_CARGADA').val()=="1")
		{
			//Validar si es la misma sursal
			if($('#H_ID_CLIENTE_ACTUAL').val()==ID_CLIENTE && $('#H_ID_SUCURSAL_ACTUAL').val()==ID_SUC)
			{
				$('#VerSensoresRegistrados_'+ID_SENSOR)[0].click();
			}
			else
			{
				alert("Sucursal cargada pero Sensor duera de la suc");
			}
		}
		else
		{		
			//Validar si el sensor de la notificacion corresponde a la sucursal en la BD
			BD_APP.transaction(function(tx) {
				tx.executeSql('SELECT id_cliente,id_sucursal,json_sucursal FROM tbl_datos', [], function(tx, rs) {
					var id_cliente=""+rs.rows.item(0).id_cliente;
					var id_sucursal=""+rs.rows.item(0).id_sucursal;
					var json_sucursal=""+rs.rows.item(0).json_sucursal;
					json_sucursal=atob(json_sucursal);
					
					var json = jQuery.parseJSON(json_sucursal);
						$.each(json, function(i, d) {
							ESTADO=d.ESTADO;
							
							if(d.ESTADO=="S")
							{
								//Cookie
								setCK(''+d.CK);
										
								ID_CLIENTE=d.ID_CLIENTE;
								ID_SUCURSAL=d.ID_SUC;
										
								//Cargando html
								$("#p2").load( "inicio.html", function() {
									$("#ModalCambioSuc3").load("html_parts/modal_cambioCliSuc.html");
									$("#ModalClave3").load("html_parts/modal_cambioClave.html");
									//Agregando menu
									$("#DivMenu").load("html_parts/menu_header.html",	function() {		
										$('#H_ID_CLIENTE_ACTUAL').val(ID_CLIENTE);
										$('#H_ID_SUCURSAL_ACTUAL').val(ID_SUCURSAL);
													
										//Estado de sucursal
										$("#Estado_Sucursal").html(d.ESTADOSUCURSAL);
										$("#IconoSucursal").html(d.ICONO_SUCURSAL);
										$("#NombreSucusal").html(d.NOMBRE_SUCURSAL_ACTUAL);	
										LOGO_CLIENTE="http://www.ingetrace.cl/sct/img/logo/"+d.LOGO_CLIENTE;
										$("#LogoCliente").attr("src",LOGO_CLIENTE);					
													
										GenerarHTMLSensores(d);									
										ActualizarDashboard();
									});//Fin load menu
									
									$('#BodyPrincipal').pagecontainer('change', '#p2', {
										transition: 'flip',
										changeHash: true,
										reverse: false,
										showLoadMsg: false
									});
									setTimeout(function () {
										if(id_cliente==ID_CLIENTE && id_sucursal==ID_SUC)
										{
											VerGraficoSensorTermico(true,ID_CLIENTE,$('#VerSensoresRegistrados_'+ID_SENSOR).attr('razon_social'),ID_SUC,$('#VerSensoresRegistrados_'+ID_SENSOR).attr('nombre_sucursal'),$('#VerSensoresRegistrados_'+ID_SENSOR).attr('id_seccion'),$('#VerSensoresRegistrados_'+ID_SENSOR).attr('nombre_seccion'),$('#VerSensoresRegistrados_'+ID_SENSOR).attr('id_equipo'),$('#VerSensoresRegistrados_'+ID_SENSOR).attr('nombre_equipo'),ID_SENSOR);
										}
										else
										{
											alert("Sensor duera de la suc");
										}
									}, 750);								
									
								});//Fin load cuerpo
							}
							else
							{
								setTimeout(function () {
									MostrarModalErrorP1('Usuario y/o contraseña invalido');
								}, 500);
								//Cerrando dialogo
								$('#DivIngresar').show();
							}
						});
					
				}, function(tx, error) {});
			});
		}
	}
	else
	{
		CerrarSplash();
		MostrarModalErrorP1('Debe volver a iniciar sesion en el dispositivo');
	}
}
function ValidarCKIncial(CK)
{
	$('#DivIngresar').hide();
	$(window).disablescroll();
	
	var ID_CLIENTE;
	var ID_SUCURSAL;
	var NOMBRESUCURSAL;
	var ESTADO="";
	var LOGO_CLIENTE="";
	
	BD_APP.transaction(function(tx) {
		tx.executeSql('SELECT json_sucursal FROM tbl_datos', [], function(tx, rs) {
			var Valor=""+rs.rows.item(0).json_sucursal;
			Valor=atob(Valor);
			
			var json = jQuery.parseJSON(Valor);
			$.each(json, function(i, d) {
				ESTADO=d.ESTADO;
				
				if(d.ESTADO=="S")
				{
					//Cookie
					setCK(''+d.CK);
							
					ID_CLIENTE=d.ID_CLIENTE;
					ID_SUCURSAL=d.ID_SUC;
							
					//Cargando html
					$("#p2").load( "inicio.html", function() {
						$("#ModalCambioSuc3").load("html_parts/modal_cambioCliSuc.html");
						$("#ModalClave3").load("html_parts/modal_cambioClave.html");
						//Agregando menu
						$("#DivMenu").load("html_parts/menu_header.html",	function() {		
							$('#H_ID_CLIENTE_ACTUAL').val(ID_CLIENTE);
							$('#H_ID_SUCURSAL_ACTUAL').val(ID_SUCURSAL);
										
							//Estado de sucursal
							$("#Estado_Sucursal").html(d.ESTADOSUCURSAL);
							$("#IconoSucursal").html(d.ICONO_SUCURSAL);
							$("#NombreSucusal").html(d.NOMBRE_SUCURSAL_ACTUAL);	
							LOGO_CLIENTE="http://www.ingetrace.cl/sct/img/logo/"+d.LOGO_CLIENTE;
							$("#LogoCliente").attr("src",LOGO_CLIENTE);					
										
							GenerarHTMLSensores(d);					
							ActualizarDashboard();
						});//Fin load menu
						
						$('#BodyPrincipal').pagecontainer('change', '#p2', {
							transition: 'flip',
							changeHash: true,
							reverse: false,
							showLoadMsg: false
						});
						setTimeout(function () {
							CerrarSplash();
						}, 500);
					});//Fin load cuerpo
				}
				else
				{
					setTimeout(function () {
						MostrarModalErrorP1('Usuario y/o contraseña invalido');
					}, 500);
					//Cerrando dialogo
					$('#DivIngresar').show();
				}
			});
			
		}, function(tx, error) {});
	});
}
function ValidarCampos()
{
	$("#submit_FormLogin").trigger("click");
	if(formularioLogin.checkValidity()){
		login();
	}
	else
	{			
		MostrarModalErrorP1('Debe ingresar usuario y contraseña');
	}
}
function MostrarModalErrorP1(Mensaje)
{
	$("#MensajeErrorTexto").html(Mensaje);
	$('#ModalErrorp1').popup('open', {
		transition: 'pop'
	});
}
function CerrarModalErrorP1(e)
{
	e.preventDefault();
	$('#ModalErrorp1').popup('close');
}
function login()
{
	$('#DivIngresar').hide();
	$('#ModalPage1').popup('open', {
		transition: 'pop'
	});
	$(window).disablescroll();
	
	$.post(RUTACONTROL,{
								accion: "login",
								Uss: $("#txtUsuario").val(),
								Pass: $("#txtContrasena").val()
								}, 
	function(response) {
		//alert(""+response);
		var json = jQuery.parseJSON(response);
		$.each(json, function(i, d) {
			if(d.ESTADO=="S")
			{				
				//Cookie
				setCK(''+d.CK);
				setJsonSucursal(d.ID_CLIENTE,d.ID_SUC,response);
				
				//Cargando html
				$("#p2").load( "inicio.html", function() {
					$("#ModalCambioSuc3").load("html_parts/modal_cambioCliSuc.html");
					$("#ModalClave3").load("html_parts/modal_cambioClave.html");
					//Agregando menu
					$("#DivMenu").load("html_parts/menu_header.html",	function() {
						
						$('#H_ID_CLIENTE_ACTUAL').val(d.ID_CLIENTE);
						$('#H_ID_SUCURSAL_ACTUAL').val(d.ID_SUC);
						
						//Estado de sucursal
						$("#Estado_Sucursal").html(d.ESTADOSUCURSAL);
						$("#IconoSucursal").html(d.ICONO_SUCURSAL);
						$("#NombreSucusal").html(d.NOMBRE_SUCURSAL_ACTUAL);				
						LOGO_CLIENTE="http://www.ingetrace.cl/sct/img/logo/"+d.LOGO_CLIENTE;
						$("#LogoCliente").attr("src",LOGO_CLIENTE);	
						
						GenerarHTMLSensores(d);
						
					});//Fin load menu
					setTimeout(function () {
						$('#BodyPrincipal').pagecontainer('change', '#p2', {
							transition: 'flip',
							changeHash: true,
							reverse: false,
							showLoadMsg: false
						});
						$('#ModalPage1').popup( "close" );
					}, 500);
				});//Fin load cuerpo
			}
			else
			{
				$('#ModalPage1').popup( "close" );
				setTimeout(function () {
				MostrarModalErrorP1('Usuario y/o contraseña invalido');
				}, 500);
				//Cerrando dialogo
				$('#DivIngresar').show();
			}
		});
	}).done(function(response) {
		$(window).disablescroll("undo");
	});
}