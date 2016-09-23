var RUTACONTROL='http://ingetrace.participa.cl/external_movil/control/control.php';
//var RUTACONTROL='http://localhost/web_ingetrace/external_movil/control/control.php';

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
			$.each(data.additionalData, function(i, d) {
				if(""+i == "additionalData")
				{
					alert(d.idcliente+" "+d.idsucursal+" "+d.idsensor);
				}
				//alert(i+" <-> "+JSON.stringify(d));
			});
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
		setTimeout(function()
		{
			BuscarCookie();
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
	$.post('http://192.168.1.34/prueba_notificacion/grabar_id.php',{ 	
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
	alert("Buscando cookie");
	var UbicacionPage=''+window.location.hash;
	var ValCK=getCK();
	
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
			setTimeout(function () {
				ValidarCKIncial(ValCK);
			}, 500);
		}
		else
		{
			setTimeout(function () {
				navigator.splashscreen.hide();
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
		HtmlTermicos+='<div class="col-xs-1 text-left" id="SENAL_'+e.ID_SENSOR+'" style="padding-left: 5px; padding-right: 5px;">'+e.SENAL+'</div><div class="col-xs-2 text-right"><a id="VerSensoresRegistrados_'+e.ID_SENSOR+'" href="#" onclick="javascript:CargarGraficoSensorTermico(event,\''+e.ID_CLIENTE+'\',\''+e.RAZON_SOCIAL+'\',\''+e.ID_SUCURSAL+'\',\''+e.NOMBRE_SUCURSAL+'\',\''+e.ID_SECCION+'\',\''+e.NOMBRE_SECCION+'\',\''+e.ID_EQUIPO+'\',\''+e.NOMBRE_EQUIPO+'\',\''+e.ID_SENSOR+'\');">';
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
}
function ValidarCKIncial(CK)
{
	try {
		navigator.splashscreen.hide();
	}
	catch(err) {}
	$('#DivIngresar').hide();
	$('#ModalPage1').popup('open', {
		transition: 'pop'
	});
	$(window).disablescroll();
	
	var ID_CLIENTE;
	var ID_SUCURSAL;
	var NOMBRESUCURSAL;
	var ESTADO="";
	var LOGO_CLIENTE="";
	
	$.post(RUTACONTROL,{
								accion: "ValidarCKIncial",
								CK: CK
								}, 
	function(response) {
		var json = jQuery.parseJSON(response);
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
					setTimeout(function () {
						if($('#H_ID_SENSOR').val()!='')
						{
							$('#VerSensoresRegistrados_'+$('#H_ID_SENSOR').val())[0].click();
						}
					}, 1250);
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
		if(ESTADO=="S")
		{
			$('#Cbo_Cliente').val(ID_CLIENTE);
			$('#Cbo_Sucursal').val(ID_SUCURSAL);
		}
		$(window).disablescroll("undo");		
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