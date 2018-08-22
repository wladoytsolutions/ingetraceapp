//var RUTACONTROL='http://ingetrace.participa.cl/external_movil/control/control.php';
//var RUTACONTROL='http://localhost/web_ingetrace/external_movil/control/control.php';
var RUTACONTROL='http://www.ingetrace.cl/external_movil/control/control.php';
//var RUTACONTROL='http://35.163.42.97:8080/ingetrace/external_movil/control/control.php';
var BD_APP=null;
var pushPlugin;
var DEVICEPLATFORM;
var MOSTRAR_MENSAJE_NOTIFICACION=false;
var TITULO_NOTIFICACION="";
var MENSAJE_NOTIFICACION="";

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
		//document.addEventListener('resume', this.onResume, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function() {
		BD_APP = window.sqlitePlugin.openDatabase({name: "ingetrace.db", location: 'default', createFromLocation: 1});
		BD_APP.transaction(function(tx) {
			tx.executeSql('CREATE TABLE IF NOT EXISTS tbl_datos (id_cliente VARCHAR (15),id_sucursal VARCHAR (4),json_sucursal TEXT,id_device TEXT)');
			tx.executeSql("select count(json_sucursal) as cnt from tbl_datos;", [], function(tx, res) {
				if(res.rows.item(0).cnt=="0")
			  	{
					tx.executeSql("INSERT INTO tbl_datos (id_cliente,id_sucursal,json_sucursal,id_device) VALUES ('Nada','Nada','Nada','Nada');");
			  	}
				
				app.receivedEvent('deviceready');
				DEVICEPLATFORM = device.platform;
				DEVICEPLATFORM = DEVICEPLATFORM.toLowerCase();
				
				setTimeout(function () {
					app.pushNotification();
				}, 2000);
			});
		});
    },
    receivedEvent: function(id) {
		
    },
	pushNotification: function(){
		FCMPlugin.getToken(function(token){
			alert(token);
			ActualizarToken(token);
		});
	
		FCMPlugin.onTokenRefresh(function(token){
			//alert(token);
			ActualizarToken(token);
		});

		FCMPlugin.onNotification(function(data){
			$('#H_DESDE_NOTIFICACION').val('1');
			
			var ID_CLIENTE;
			var NOMBRE_CLIENTE;
			var ID_SUCURSAL;
			var NOMBRE_SUCURSAL;
			var ID_SECCION;
			var NOMBRE_SECCION;
			var ID_EQUIPO;
			var NOMBRE_EQUIPO;
			var ID_SENSOR;
			var TIPO_MODELO;

			TITULO_NOTIFICACION=data.title;
			MENSAJE_NOTIFICACION=data.message;

			ID_CLIENTE=data.id_cliente;
			NOMBRE_CLIENTE=data.nombre_cliente;
			ID_SUCURSAL=data.id_sucursal;
			NOMBRE_SUCURSAL=data.nombre_sucursal;
			ID_SECCION=data.id_seccion;
			NOMBRE_SECCION=data.nombre_seccion;
			ID_EQUIPO=data.id_equipo;
			NOMBRE_EQUIPO=data.nombre_equipo;
			ID_SENSOR=data.id_sensor;
			TIPO_MODELO=data.tipo_modelo;

			setTimeout(function () {
				if(TIPO_MODELO!='M')
				{
					CargarNotificacion(ID_CLIENTE,NOMBRE_CLIENTE,ID_SUCURSAL,NOMBRE_SUCURSAL,ID_SECCION,NOMBRE_SECCION,ID_EQUIPO,NOMBRE_EQUIPO,ID_SENSOR,TIPO_MODELO);
				}
				else
				{
					MOSTRAR_MENSAJE_NOTIFICACION=true;
					if($('#H_SUCURSAL_CARGADA').val()!="1")
					{
						//alert('Buscando aca 03');
						BuscarCookie();
					}
					else
					{
						MOSTRAR_MENSAJE_NOTIFICACION=false;
						MensajeAlerta(TITULO_NOTIFICACION,MENSAJE_NOTIFICACION);
					}
				}
			}, 250);
		});
    },
	onResume: function() {
		//alert('Disparado');
	}
};
function ActualizarToken(ID_device)
{
	BD_APP = window.sqlitePlugin.openDatabase({name: "ingetrace.db", location: 'default'});
	BD_APP.transaction(function(tx) {
		tx.executeSql('SELECT id_device FROM tbl_datos;', [], function(tx, rs) {
		var id_device_bd=""+rs.rows.item(0).id_device;
			
		if(id_device_bd!="Nada")
		{
			//Se actualizara el device ID y fecha para el dispositivo y tenerlo como activo
			//Si el id device cambio, se debe notificar el cambio al servidor
			$.ajax({
					url	: RUTACONTROL,
					type: 'POST',
					data: 
					{
						accion		: 'UpdateIdDevice',
						NewId_device: ID_device,
						OldId_device: id_device_bd,
						CK			: getCK()
					},
					async: false
			}). done(function(response) {
				if(id_device_bd!=ID_device)
				{
					setIdDevice(ID_device);
				}
				setTimeout(function () {
					if($('#H_DESDE_NOTIFICACION').val()!='1')
					{
						BuscarCookie();
					}
				}, 500);
			});
		}
		else
		{
			//Si es nada se registrara en BD local
			if(id_device_bd=="Nada")
			{
				setIdDevice(ID_device);
				setTimeout(function () {
					if($('#H_DESDE_NOTIFICACION').val()!='1')
					{
						BuscarCookie();
					}
				}, 500);
			}
		}
			
		}, function(tx, error) {
			
		});
	});
}
function MensajeAlerta(Titulo,Mensaje)
{
	navigator.notification.alert(
		Mensaje,  // message
		alertDismissed,         // callback
		Titulo,            // title
		'Aceptar'                  // buttonName
	);
}
function alertDismissed() {
    // do something
}
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
	var StringJson=""+Base64.encode(""+json);
	BD_APP = window.sqlitePlugin.openDatabase({name: "ingetrace.db", location: 'default', createFromLocation: 1});
	BD_APP.transaction(function(tx) {
		var StringQuery="UPDATE tbl_datos SET id_cliente='"+id_cliente+"', id_sucursal='"+id_sucursal+"', json_sucursal='"+StringJson+"'";
		tx.executeSql(StringQuery);
	});
}
function setIdDevice(IdDevice)
{
	$("#H_TEXT_DEVICE").html(IdDevice);
	BD_APP = window.sqlitePlugin.openDatabase({name: "ingetrace.db", location: 'default', createFromLocation: 1});
	BD_APP.transaction(function(tx) {
		var StringQuery="UPDATE tbl_datos SET id_device='"+IdDevice+"'";
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
		$(this).removeClass("marquee").addClass("marquee-cargada");
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

  //Sensores termicos
  var HtmlTermicos='';

  $("#H_FECHA_HOY").val(DATOS.FECHA_HOY);

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
	  
    if(e.ID_SENSOR_PUERTA!="")
    {
      HtmlTermicos+='<div class="col-xs-1 text-left" id="SENAL_'+e.ID_SENSOR+'" style="padding-left: 5px; padding-right: 5px;">'+e.SENAL+'</div><div class="col-xs-1 text-left" id="PUERTA_'+e.ID_SENSOR_PUERTA+'" style="padding-left: 5px; padding-right: 5px;">'+e.PUERTA+'</div><div class="col-xs-1 text-right" style="padding-right: 2px;padding-left: 0px;"><a id="VerSensoresRegistrados_'+e.ID_SENSOR+'" href="#" onclick="javascript:CargarGraficoSensorTermico(event,\''+e.ID_CLIENTE+'\',\''+e.RAZON_SOCIAL+'\',\''+e.ID_SUCURSAL+'\',\''+e.NOMBRE_SUCURSAL+'\',\''+e.ID_SECCION+'\',\''+e.NOMBRE_SECCION+'\',\''+e.ID_EQUIPO+'\',\''+e.NOMBRE_EQUIPO+'\',\''+e.ID_SENSOR+'\',\''+e.TIPO_MODELO+'\');">';
      HtmlTermicos+='<span class="pull-right"><i class="fa fa-arrow-circle-right"></i></span><div class="clearfix"></div></a></div>';
    }
    else
    {
      HtmlTermicos+='<div class="col-xs-1 text-left" id="SENAL_'+e.ID_SENSOR+'" style="padding-left: 5px; padding-right: 5px;">'+e.SENAL+'</div><div class="col-xs-2 text-right"><a id="VerSensoresRegistrados_'+e.ID_SENSOR+'" href="#" onclick="javascript:CargarGraficoSensorTermico(event,\''+e.ID_CLIENTE+'\',\''+e.RAZON_SOCIAL+'\',\''+e.ID_SUCURSAL+'\',\''+e.NOMBRE_SUCURSAL+'\',\''+e.ID_SECCION+'\',\''+e.NOMBRE_SECCION+'\',\''+e.ID_EQUIPO+'\',\''+e.NOMBRE_EQUIPO+'\',\''+e.ID_SENSOR+'\',\''+e.TIPO_MODELO+'\');">';
      HtmlTermicos+='<span class="pull-right"><i class="fa fa-arrow-circle-right"></i></span><div class="clearfix"></div></a></div>';
    }

    HtmlTermicos+='</div></div>';
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
    HtmlTermicos+='<h3 id="Cont_Alarma_Temp_'+e.ID_SENSOR+'" class="no-margins">'+e.ALARMA+'</h3>';
    HtmlTermicos+='<small>Ult. Alarma</small></div></div></div></div></div>';
  });

  //Sensores humedad
  $.each(DATOS.SENSORES_HUMEDAD, function(j, e) {
    var NombreEquipo=e.NOMBRE_EQUIPO+'';
    var ClaseMarqueDiv='';
    var ClaseMarque='';

    if(NombreEquipo.length>19)
    {
      ClaseMarqueDiv='marquee';
      ClaseMarque='marquee-text';
    }

    TermicosVisibles=true;

    HtmlTermicos+='<div id="Contenedor_'+e.ID_SENSOR+'" class="col-lg-6 col-md-6 colmod" style="min-height: 220px"><div class="panel panel-red"><div class="panel-heading"><div class="row">';
    HtmlTermicos+='<div class="col-xs-1 text-left" style="padding-left: 5px; padding-right: 0px;">';
    HtmlTermicos+='<span id="IconoSensor_'+e.ID_SENSOR+'">'+e.STATUS_EQUIPO+'</span>';
    HtmlTermicos+='</div>';
    HtmlTermicos+=e.DIV_NOMBRE_EQUIPO;

    if(e.ID_SENSOR_PUERTA!="")
    {
      HtmlTermicos+='<div class="col-xs-1 text-left" id="HMD_SENAL_'+e.ID_SENSOR+'" style="padding-left: 5px; padding-right: 5px;">'+e.SENAL+'</div><div class="col-xs-1 text-left" id="PUERTA_'+e.ID_SENSOR_PUERTA+'" style="padding-left: 5px; padding-right: 5px;">'+e.PUERTA+'</div><div class="col-xs-1 text-right" style="padding-right: 2px;padding-left: 0px;"><a id="VerSensoresRegistrados_'+e.ID_SENSOR+'" href="#" onclick="javascript:CargarGraficoSensorTermico(event,\''+e.ID_CLIENTE+'\',\''+e.RAZON_SOCIAL+'\',\''+e.ID_SUCURSAL+'\',\''+e.NOMBRE_SUCURSAL+'\',\''+e.ID_SECCION+'\',\''+e.NOMBRE_SECCION+'\',\''+e.ID_EQUIPO+'\',\''+e.NOMBRE_EQUIPO+'\',\''+e.ID_SENSOR+'\',\''+e.TIPO_MODELO+'\');">';
      HtmlTermicos+='<span class="pull-right"><i class="fa fa-arrow-circle-right"></i></span><div class="clearfix"></div></a></div>';
    }
    else
    {
      HtmlTermicos+='<div class="col-xs-1 text-left" id="SENAL_'+e.ID_SENSOR+'" style="padding-left: 5px; padding-right: 5px;">'+e.SENAL+'</div><div class="col-xs-2 text-right"><a id="VerSensoresRegistrados_'+e.ID_SENSOR+'" href="#" onclick="javascript:CargarGraficoSensorTermico(event,\''+e.ID_CLIENTE+'\',\''+e.RAZON_SOCIAL+'\',\''+e.ID_SUCURSAL+'\',\''+e.NOMBRE_SUCURSAL+'\',\''+e.ID_SECCION+'\',\''+e.NOMBRE_SECCION+'\',\''+e.ID_EQUIPO+'\',\''+e.NOMBRE_EQUIPO+'\',\''+e.ID_SENSOR+'\',\''+e.TIPO_MODELO+'\');">';
      HtmlTermicos+='<span class="pull-right"><i class="fa fa-arrow-circle-right"></i></span><div class="clearfix"></div></a></div>';
    }

    HtmlTermicos+='</div></div>';
    HtmlTermicos+='<div class="panel-body"><div class="row col-with-divider"><div class="col-xs-4 text-center stack-order">';
    HtmlTermicos+='<h1 class="no-margins Cifras" id="TempMin_'+e.ID_SENSOR+'">'+e.MINIMA+'</h1>';
    HtmlTermicos+='<small><span id="HORA_MINIMA_'+e.ID_SENSOR+'">'+e.HORA_MINIMA+'</span><br>Mínima</small>';
    HtmlTermicos+='</div>';
    HtmlTermicos+='<div class="col-xs-4 text-center stack-order" style="padding-left: 5px;padding-right: 5px;"> ';
    HtmlTermicos+=e.TEMPERATURA;
    HtmlTermicos+='<div align="center" style="display:none" id="Fecha_'+e.ID_SENSOR+'">'+e.FECHA+'</div>';
    HtmlTermicos+='<small><span id="Hora_'+e.ID_SENSOR+'">'+e.HORA+'</span><br>Actual</small>';
    HtmlTermicos+='</div>';
    HtmlTermicos+='<div class="col-xs-4 text-center stack-order">';
    HtmlTermicos+='<h1 class="no-margins Cifras" id="TempMax_'+e.ID_SENSOR+'">'+e.MAXIMA+'</h1>';
    HtmlTermicos+='<small><span id="HORA_MAXIMA_'+e.ID_SENSOR+'">'+e.HORA_MAXIMA+'</span><br>Máxima</small>';
    HtmlTermicos+='</div></div>';
    HtmlTermicos+='<div class="row col-with-divider"><div class="col-xs-4 text-center stack-order">';
    HtmlTermicos+='<h1 class="no-margins Cifras" id="Cota_'+e.ID_SENSOR+'">'+e.COTA+'</h1><small>Límite</small></div>';
    HtmlTermicos+='<div class="col-xs-8 text-center stack-order"><h3 class="no-margins" id="Tr_sens_'+e.ID_SENSOR+'">';
    HtmlTermicos+='<div id="Cont_Alarma_Temp_'+e.ID_SENSOR+'" align="center">'+e.ALARMA+'</div>';
    HtmlTermicos+='</h3><small>Ult. Alarma</small></div>';
    HtmlTermicos+='</div>';
    HtmlTermicos+='<div class="row col-with-divider"><div class="col-xs-4 text-center stack-order">';
    HtmlTermicos+='<h1 class="no-margins Cifras" id="HMD_Min_'+e.ID_SENSOR+'">'+e.HMD_MINIMA+'%</h1>';
    HtmlTermicos+='<small><span id="HMD_HORA_MINIMA_'+e.ID_SENSOR+'">'+e.HMD_HORA_MINIMA+'</span><br>Mínima</small>';
    HtmlTermicos+='</div>';
    HtmlTermicos+='<div class="col-xs-4 text-center stack-order" style="padding-left: 5px;padding-right: 5px;">';
    HtmlTermicos+=e.HUMEDAD;
    HtmlTermicos+='<div align="center" style="display:none" id="HMD_Fecha_'+e.ID_SENSOR+'">'+e.HMD_FECHA+'</div>';
    HtmlTermicos+='<small><span id="HMD_Hora_'+e.ID_SENSOR+'">'+e.HMD_HORA+'</span><br>Actual</small>';
    HtmlTermicos+='</div>';
    HtmlTermicos+='<div class="col-xs-4 text-center stack-order">';
    HtmlTermicos+='<h1 class="no-margins Cifras" id="HMD_Max_'+e.ID_SENSOR+'">'+e.HMD_MAXIMA+'%</h1>';
    HtmlTermicos+='<small><span id="HMD_HORA_MAXIMA_'+e.ID_SENSOR+'">'+e.HMD_HORA_MAXIMA+'</span><br>Máxima</small>';
    HtmlTermicos+='</div></div>';
    HtmlTermicos+='<div class="row col-with-divider"><div class="col-xs-4 text-center stack-order">';
    HtmlTermicos+='<h1 class="no-margins Cifras" id="HMD_Cota_'+e.ID_SENSOR+'">'+e.HMD_Cota+'%</h1>';
    HtmlTermicos+='<small>Límite</small></div>';
    HtmlTermicos+='<div class="col-xs-8 text-center stack-order"><h3 class="no-margins" id="HMD_Tr_sens_'+e.ID_SENSOR+'">';
    HtmlTermicos+='<div id="Cont_Alarma_Humedad_'+e.ID_SENSOR+'" align="center">'+e.HMD_ULT_ALARMA+'</div>';
    HtmlTermicos+='</h3><small>Ult. Alarma</small></div>';
    HtmlTermicos+='</div></div></div></div>';
  });
	
	//Sensores solo puerta
	$.each(DATOS.SENSORES_SOLO_PUERTA, function(j, e) {
		var NombreEquipo=e.NOMBRE_EQUIPO+'';
		var ClaseMarqueDiv='';
		var ClaseMarque='';

		if(NombreEquipo.length>19)
		{
			ClaseMarqueDiv='marquee';
			ClaseMarque='marquee-text';
		}

		TermicosVisibles=true;
		
		HtmlTermicos+='<div class="col-lg-6 col-md-6 colmod"><div class="panel panel-red"><div class="panel-heading"><div class="row"><div class="col-xs-1 text-left" style="padding-left: 5px; padding-right: 0px;">';
		HtmlTermicos+='<span id="IconoSensor_'+e.IDSENSOR+'">'+e.STATUS_EQUIPO+'</span></div>';
		HtmlTermicos+=e.DIV_NOMBRE_EQUIPO;
		HtmlTermicos+='<div id="SENAL_'+e.IDSENSOR+'" class="col-xs-2 text-right">'+e.SENAL+'</i></div>';
		HtmlTermicos+='<div class="col-xs-1 text-right" style="padding-right: 0px;">';
		HtmlTermicos+='<a href="#" onclick="javascript:CargarSensorSoloPuerta(event,\''+e.ID_CLIENTE+'\',\''+e.RAZON_SOCIAL+'\',\''+e.ID_SUCURSAL+'\',\''+e.NOMBRE_SUCURSAL+'\',\''+e.ID_SECCION+'\',\''+e.NOMBRE_SECCION+'\',\''+e.ID_EQUIPO+'\',\''+e.NOMBRE_EQUIPO+'\',\''+e.IDSENSOR+'\',\'6\');" id="VerSensoresRegistrados_'+e.IDSENSOR+'" razon_social="'+e.RAZON_SOCIAL+'" idsensor="'+e.IDSENSOR+'" nombre_sucursal="'+e.NOMBRE_SUCURSAL+'" id_seccion="'+e.ID_SECCION+'" nombre_seccion="'+e.NOMBRE_SECCION+'" id_equipo="'+e.ID_EQUIPO+'" nombre_equipo="'+e.NOMBRE_EQUIPO+'"><span class="pull-right"><i class="fa fa-arrow-circle-right"></i></span></a>';
		
		HtmlTermicos+='</div></div></div>';
		HtmlTermicos+='<div class="panel-body"><div class="row col-with-divider"><div class="col-xs-4 text-center stack-order">';
		HtmlTermicos+='<h1 class="no-margins" id="Estado_'+e.IDSENSOR+'">'+e.ICONO_ESTADO+'</h1><small>Estado</small></div>';
		HtmlTermicos+='<div class="col-xs-8 text-center stack-order"><h3 class="no-margins"><div align="center" id="Desde_'+e.IDSENSOR+'">'+e.FECHA_HORA+'</div></h3><small>Desde</small></div>';
		HtmlTermicos+='</div></div></div></div>';
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
		HtmlElectricos+='<a id="VerSensoresRegistrados_'+f.IDSENSOR+'" href="#" onclick="javascript:CargarGraficoSensorElectrico(event,\''+f.IDSENSOR+'\',\''+f.EQUIPO+'\');" nombre_equipo="'+NombreEquipo+'">';
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

	if(DEVICEPLATFORM == 'android')
	{
		$('#top-nav-plataform').css('background-color','#222222');
	}
}
function VerGraficoSensorTermico(HideSplash,IdCliente,NombreCliente,IdSucursal,NombreSucursal,IdSeccion,NombreSeccion,IdEquipo,NombreEquipo,IdSensor,TipoModelo)
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
		
				$("#H_ID_CLIENTE").val(IdCliente);
				$("#H_ID_SUCURSAL").val(IdSucursal);
				$("#H_ID_SECCION").val(IdSeccion);
				$("#H_NOMBRE_SECCION").val(NombreSeccion);
				$("#H_ID_EQUIPO").val(IdEquipo);
				$("#H_NOMBRE_EQUIPO").val(NombreEquipo);
				$("#H_ID_SENSOR").val(IdSensor);
				$("#H_TIPO_MODELO").val(TipoModelo);

			$("#RowContenidoCuerpoP3").load(
				"html_parts/modal_datosSensorTermico.html",
			function() {

				if(HideSplash)
				{
					CerrarSplash();
				}

				$.mobile.pageContainer.pagecontainer('change', '#p3', {
						transition: 'flip',
						changeHash: true,
						reverse: true,
						showLoadMsg: false
					});

				//HTML CARGADO
				//Fecha hoy
				$("#FechaBitacoraHoy").html($("#H_FECHA_HOY").val());
				$("#inicio_filtroDatosSensor").val($("#H_FECHA_HOY").val());
				$("#termino_filtroDatosSensor").val($("#H_FECHA_HOY").val());

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

				$.post(RUTACONTROL,
						{
							accion: "DatosGraficoSensorTermico",
							IdCliente: 	IdCliente,
							IdSucursal: IdSucursal,
							IdSeccion: 	IdSeccion,
							IdEquipo: 	IdEquipo,
							IdSensor:	IdSensor,
							TipoModelo: TipoModelo
						},
				function(response) {
					var json = jQuery.parseJSON(response);
					$("#JSON_DATOS").html(response);
					$("#TituloModalGrafico").html(NombreCliente+' - '+NombreSucursal+' - '+NombreEquipo+'('+IdSensor+')');

					optionsLineal=GenerarGraficoSensor(json,false);

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
						/**
						setTimeout(function () {
							$("#Li_TablaAlarmas").show("fade");
							$("#Li_Tabla").show("fade");
						}, 2000);
						*/
					}, 750);
				});
			});
	});
}
function VerSensorSoloPuerta(HideSplash,IdCliente,NombreCliente,IdSucursal,NombreSucursal,IdSeccion,NombreSeccion,IdEquipo,NombreEquipo,IdSensor,TipoModelo)
{
	$(window).disablescroll();
	$('#ModalPage2').popup('open', {
		transition: 'pop'
	});

	$("#p3Body").html("");
	
	$("#p3Body").load(
		"sensor.html",
	function() {
				$("#H_ID_CLIENTE").val(IdCliente);
				$("#H_ID_SUCURSAL").val(IdSucursal);
				$("#H_ID_SECCION").val(IdSeccion);
				$("#H_NOMBRE_SECCION").val(NombreSeccion);
				$("#H_ID_EQUIPO").val(IdEquipo);
				$("#H_NOMBRE_EQUIPO").val(NombreEquipo);
				$("#H_ID_SENSOR").val(IdSensor);
				$("#H_TIPO_MODELO").val(TipoModelo);
		
			$("#RowContenidoCuerpoP3").load(
				"html_parts/modal_datos_sensor_solo_puerta.html",
			function() {
				if(HideSplash)
				{
					CerrarSplash();
				}
				
				$("#TituloModalGrafico").html(NombreCliente+' - '+NombreSucursal+' - '+NombreEquipo+'('+IdSensor+')');
					

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
				
					$('#ModalPage2').popup("close");
					$(window).disablescroll("undo");
					setTimeout(function () {
						$('#btn_buscarGrafico').prop("disabled",false);
						$("#H_TAB_GRAFICO_CARGADO").val("ok");
					}, 750);
			});
	});
}
function VerSensorElectrico(HideSplash,IdSensor,NombreEquipo)
{
	$(window).disablescroll();

	$('#ModalPage2').popup('open', {
		transition: 'pop'
	});

	$("#H_ID_SENSOR").val(IdSensor);

	$("#p3Body").load(
		"sensor.html",
	function() {
		$("#RowContenidoCuerpoP3").load(
			"html_parts/modal_datosSensorElectrico.html",
		function() {
			$('#H_SENSOR_ELECTRICO').val(IdSensor);
			$("#TituloModalGrafico").html(NombreEquipo+'('+IdSensor+')');

			if(HideSplash)
			{
				CerrarSplash();
			}

			var CuerpoDatos='';

			$.post(RUTACONTROL,{
							accion 		 : 'DatosGraficoSensorElectrico',
							ID_SENSOR    : IdSensor,
							FechaInicio  : '',
							FechaTermino : ''
							},
			function(response) {

				var json = jQuery.parseJSON(response);
				
				$("#inicio_filtroDatosSensorElectrico").val(json['FECHA_HOY']);
				var FecIni=json['FECHA_HOY'];
				var fecha_inicio=FecIni.substring(6, 10)+'-'+FecIni.substring(3, 5)+'-'+FecIni.substring(0, 2);
				$('#inicio_filtroDatosSensorElectrico').datepicker("setDate", new Date(parseInt(FecIni.substring(6, 10)),parseInt(FecIni.substring(3, 5))-1,parseInt(FecIni.substring(0, 2))));

				$("#termino_filtroDatosSensorElectrico").val(json['FECHA_HOY']);
				var FecTerm=json['FECHA_HOY'];
				var fecha_termino=FecTerm.substring(6, 10)+'-'+FecTerm.substring(3, 5)+'-'+FecTerm.substring(0, 2);
				$('#termino_filtroDatosSensorElectrico').datepicker("setDate", new Date(parseInt(FecTerm.substring(6, 10)),parseInt(FecTerm.substring(3, 5))-1,parseInt(FecTerm.substring(0, 2))));

				$.each(json.ITEMS, function(i, d) {
					CuerpoDatos+='<tr><td style="width: 19%"><center>'+d.HORA+'</center></td><td style="width: 21%">';

					var imagen='';
					if(d.ACCION=="Closed")
					{
						imagen='<i style="color: #08fa06" class="glyphicon glyphicon-off"></i>';
					}
					else
					{
						imagen='<i style="color: #fd0002" class="glyphicon glyphicon-off"></i>';
					}

					CuerpoDatos+='<center>'+imagen+'</center><span style="display:none">'+d.ACCION+'</span></td>';

					CuerpoDatos+='<td style="width: 24%"><center>'+d.TIEMPO_DE_USO+'</center></td>';
					CuerpoDatos+='</tr>';
				});

				$("#tBodyDatosGrafico").html(CuerpoDatos);

				$.mobile.pageContainer.pagecontainer('change', '#p3', {
					transition: 'flip',
					changeHash: true,
					reverse: true,
					showLoadMsg: false
				});

			}).done(function(response) {
				$('#ModalPage2').popup('close');
				$(window).disablescroll("undo");
				setTimeout(function () {
					$("#TablaDatosSensores").dataTable({
						"language": {
						"url": "json/spanish.json"
						},
						"scrollY":        "230px",
						"bInfo"	 :	false,
						"scrollCollapse": true,
						"paging":         false,
						"searching": false,
						"order": [[ 0, "desc" ]]
					});

					$("#btn_buscarGrafico").prop('disabled', false);
						setTimeout(function () {
							RecargarTabla();
						},250);
					}, 750);
			});
		});
	});
}
function GenerarGraficoSensor(json,busqueda_manual)
{
	var optionsLineal;

	//TENDENCIA
	var CuerpoDatos='';
	var CuerpoAlarmas='';
	var IconoTendencia='';
	var DataSensor = new Array();
	var DataSensorHumedad = new Array();
	var LimitesPuerta = new Array();
	var LimiteSensor = new Array();
	var PromedioSensor = new Array();
	var Promedio=0;
	var Limite=0;
	var Promedio_Humedad=0;
	var Limite_Humedad=0;
	var Minimo=0;

	if($("#H_TIPO_MODELO").val()=="1")
	{
		$.each(json, function(j, e) {
			//Fecha hoy
			$("#FechaBitacoraHoy").html(e.FECHA_HOY);
							
			if(!busqueda_manual)
			{
				$("#inicio_filtroDatosSensor").val(e.FECHA_HOY);
				var FecIni=e.FECHA_HOY;
				var fecha_inicio=FecIni.substring(6, 10)+'-'+FecIni.substring(3, 5)+'-'+FecIni.substring(0, 2);
				$('#inicio_filtroDatosSensor').datepicker("setDate", new Date(parseInt(FecIni.substring(6, 10)),parseInt(FecIni.substring(3, 5))-1,parseInt(FecIni.substring(0, 2))));

				$("#termino_filtroDatosSensor").val(e.FECHA_HOY);
				var FecTerm=e.FECHA_HOY;
				var fecha_termino=FecTerm.substring(6, 10)+'-'+FecTerm.substring(3, 5)+'-'+FecTerm.substring(0, 2);
				$('#termino_filtroDatosSensor').datepicker("setDate", new Date(parseInt(FecTerm.substring(6, 10)),parseInt(FecTerm.substring(3, 5))-1,parseInt(FecTerm.substring(0, 2))));
			}

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

			LimitesPuerta=GetLimitesPuerta(e.JSON_DATOS_PUERTA);

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
						xAxis: [],
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

			//Linea Eje X
			var LineasX	= {
				plotBands: LimitesPuerta,
				type: 'datetime',
				labels: {
					overflow: 'justify'
				},
				dateTimeLabelFormats: { 
					// don't display the dummy year
					second: '%H:%M:%S'
				}
			};

			var LineasY = {
				title: {
					text: 'T °'
				},
				plotLines: [
				{
					value: Promedio,
					color: 'green',
					dashStyle: 'shortdash',
					width: 2,
					label: {
						text: 'Prom.'
					}
				},
				{
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
			optionsLineal.xAxis.push(LineasX);

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
			optionsLineal.title.text.push($('#H_NOMBRE_EQUIPO').val());
		});
	}//Fin $("#H_TIPO_MODELO").val()!="5"

	//Si es de humedad
	if($("#H_TIPO_MODELO").val()=="5")
	{
		$.each(json, function(j, e) {
			//Fecha hoy
			$("#FechaBitacoraHoy").html(e.FECHA_HOY);
			$("#inicio_filtroDatosSensor").val(e.FECHA_HOY);
			var FecIni=e.FECHA_HOY;
			var fecha_inicio=FecIni.substring(6, 10)+'-'+FecIni.substring(3, 5)+'-'+FecIni.substring(0, 2);
			$('#inicio_filtroDatosSensor').datepicker("setDate", new Date(parseInt(FecIni.substring(6, 10)),parseInt(FecIni.substring(3, 5))-1,parseInt(FecIni.substring(0, 2))));
								
			$("#termino_filtroDatosSensor").val(e.FECHA_HOY);
			var FecTerm=e.FECHA_HOY;
			var fecha_termino=FecTerm.substring(6, 10)+'-'+FecTerm.substring(3, 5)+'-'+FecTerm.substring(0, 2);
			$('#termino_filtroDatosSensor').datepicker("setDate", new Date(parseInt(FecTerm.substring(6, 10)),parseInt(FecTerm.substring(3, 5))-1,parseInt(FecTerm.substring(0, 2))));

			var Promedio=0;
			var Limite=0;
			var BanderaGrafico=false;

			//Tabla tendencia
			$.each(e.JSON_DATOS_TEMPERATURA_HUMEDAD, function(i, d) {
				//Validando TENDENCIA en Iconos
				if(!BanderaGrafico)
				{
					BanderaGrafico=true;
					Promedio=parseFloat(d.VAR_PROMEDIO);
					Limite=parseFloat(d.LIMSUPC);
					Promedio_Humedad=parseFloat(d.VAR_HMD_PROMEDIO);
					Limite_Humedad=parseFloat(d.VAR_HMD_LIMSUPC);
				}

				var ValorSensor=parseFloat(d.temperatura);
				var ValorHumedad=parseFloat(d.humedad);

				var FECHAHORA=''+d.fechaHora;
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
				if(ValorHumedad == -1)
				{
					ValorHumedad=0;
				}

				var mesmenos1=parseInt(mes-1);

				var item = [Date.UTC(parseInt(anio),mesmenos1,parseInt(dia),parseInt(hora),parseInt(min),parseInt(seg)), ValorSensor];
				DataSensor.push(item);

				var item2 = [Date.UTC(parseInt(anio),mesmenos1,parseInt(dia),parseInt(hora),parseInt(min),parseInt(seg)), ValorHumedad];
				DataSensorHumedad.push(item2);

			});

			LimitesPuerta=GetLimitesPuerta(e.JSON_DATOS_PUERTA);

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
					useHTML: true
				},
				xAxis: [],
				yAxis: [],
				tooltip: {
					formatter:function(){
						
						var NombreSerie=''+this.series.name;
						var Medida='';
						var HtmlMensaje= '<label style="color:'+this.series.color+'; font-weight: bold;">'+NombreSerie+'</label><br>'+Highcharts.dateFormat('%H:%M:%S',this.x)+' -> '+Highcharts.numberFormat(this.y,2);
						
						if(NombreSerie.toUpperCase() =='HUMEDAD')
						{
							Medida='%';
						}
						else
						{
							Medida='°C';
						}
						
						return HtmlMensaje+=' '+Medida;
					},
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

			//Datos temperatura
			var SerieTemperatura = {
				name: 'Temperatura',
				type: 'spline',
				color: Highcharts.getOptions().colors[1],
				marker : {
					enabled : false,
				},
				tooltip: {
					valueSuffix: ' °C'
				},
				data: DataSensor
			};
			
			optionsLineal.series.push(SerieTemperatura);

			//Datos Humedad
			var SerieHumedad = {
				name: 'Humedad',
				type: 'spline',
				color: Highcharts.getOptions().colors[0],
				yAxis: 1,
				marker : {
					enabled : false,
				},
				tooltip: {
					valueSuffix: ' %'
				},
				data: DataSensorHumedad
			};
			
			optionsLineal.series.push(SerieHumedad);

			//Linea Eje X
			var LineasX	= {
				plotBands: LimitesPuerta,
				type: 'datetime',
				labels: {
					overflow: 'justify'
				},
				dateTimeLabelFormats: { // don't display the dummy year
					second: '%H:%M:%S'
				}
			};

			var LineasY = {
				title: {
					text: 'Temperatura',
					style: {
						color: Highcharts.getOptions().colors[1]
					}
				},
				labels: {
					format: '{value} °C',
					style: {
						color: Highcharts.getOptions().colors[1]
					}
				},
				plotLines: [
				{
					//Promedio Temperatura
					value: Promedio,
					color: 'green',
					dashStyle: 'shortdash',
					width: 2,
					label: {
						text: 'Prom. Temp.'
					}
				},
				{
					//Limite Temperatura
					value: Limite,
					color: 'red',
					dashStyle: 'Solid',
					width: 2,
					label: {
						text: 'Max. Temp'
					}
				}]
			};

			var LineasYDerecha = { // Secondary yAxis
				title: {
					text: 'Humedad',
						style: {
							color: Highcharts.getOptions().colors[0]
						}
				},
				labels: {
					format: '{value} %',
					style: {
							color: Highcharts.getOptions().colors[0]
					}
				},
				opposite: true,
				plotLines: [
				{
					//Promedio Humedad
					value: Promedio_Humedad,
					color: 'green',
					dashStyle: 'ShortDot',
					width: 2,
					label: {
						text: 'Prom. Hum.'
					}
				},
				{
					//Limite Humedad
					value: Limite_Humedad,
					color: 'red',
					dashStyle: 'ShortDot',
					width: 2,
					label: {
						text: 'Max. Hum'
					}
				}
				]
			};

			optionsLineal.yAxis.push(LineasY);
			optionsLineal.yAxis.push(LineasYDerecha);
			optionsLineal.xAxis.push(LineasX);
			// Render the chart
			optionsLineal.title.text.push($('#H_NOMBRE_EQUIPO').val());
		});
					}//Fin si es tipo 5
	return optionsLineal;
}
function CargarNotificacion(FUN_ID_CLIENTE,FUN_NOMBRE_CLIENTE,FUN_ID_SUCURSAL,FUN_NOMBRE_SUCURSAL,FUN_ID_SECCION,FUN_NOMBRE_SECCION,FUN_ID_EQUIPO,FUN_NOMBRE_EQUIPO,FUN_ID_SENSOR, FUN_TIPO_MODELO)
{
	//Verificando si hay CK
	var ValCK=getCK();
	
	if(ValCK!="undefined" && ValCK!="" && ValCK.toUpperCase()!="NULL")
	{
		//Validar si la sucursal esta cargada
		if($('#H_SUCURSAL_CARGADA').val()=="1")
		{
			//Validar si estamos en la pantalla p3
			if($.mobile.activePage.attr('id')=="p3")
			{
				$.mobile.pageContainer.pagecontainer('change', '#p2', {
					transition: 'flip',
					changeHash: true,
					reverse: false,
					showLoadMsg: false
				});
			}
			//Validar si es la misma sursal
			if($('#H_ID_CLIENTE_ACTUAL').val()==FUN_ID_CLIENTE && $('#H_ID_SUCURSAL_ACTUAL').val()==FUN_ID_SUCURSAL)
			{
				$('#VerSensoresRegistrados_'+FUN_ID_SENSOR)[0].click();
			}
			else
			{
				//Otra sucursal
				if(FUN_TIPO_MODELO=='1' || FUN_TIPO_MODELO=='5')
				{
					VerGraficoSensorTermico(true,FUN_ID_CLIENTE,FUN_NOMBRE_CLIENTE,FUN_ID_SUCURSAL,FUN_NOMBRE_SUCURSAL,FUN_ID_SECCION,FUN_NOMBRE_SECCION,FUN_ID_EQUIPO,FUN_NOMBRE_EQUIPO,FUN_ID_SENSOR,FUN_TIPO_MODELO);
				}
				if(FUN_TIPO_MODELO=='2')
				{
					VerSensorElectrico(true,FUN_ID_SENSOR,FUN_NOMBRE_EQUIPO);
				}
				if(FUN_TIPO_MODELO=='6')
				{
					VerSensorSoloPuerta(true,FUN_ID_CLIENTE,FUN_NOMBRE_CLIENTE,FUN_ID_SUCURSAL,FUN_NOMBRE_SUCURSAL,FUN_ID_SECCION,FUN_NOMBRE_SECCION,FUN_ID_EQUIPO,FUN_NOMBRE_EQUIPO,FUN_ID_SENSOR,FUN_TIPO_MODELO);
				}
			}
		}
		else
		{
			//Validar si el sensor de la notificacion corresponde a la sucursal en la BD
			BD_APP = window.sqlitePlugin.openDatabase({name: "ingetrace.db", location: 'default'});
			BD_APP.transaction(function(tx) {
				tx.executeSql('SELECT id_cliente,id_sucursal,json_sucursal FROM tbl_datos', [], function(tx, rs) {
					var id_cliente=""+rs.rows.item(0).id_cliente;
					var id_sucursal=""+rs.rows.item(0).id_sucursal;
					var json_sucursal=""+rs.rows.item(0).json_sucursal;
					json_sucursal=Base64.decode(json_sucursal);

					var json = jQuery.parseJSON(json_sucursal);
						$.each(json, function(i, d) {
							ESTADO=d.ESTADO;
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
										$('#H_ID_CLIENTE_ACTUAL').val(id_cliente);
										$('#H_ID_SUCURSAL_ACTUAL').val(id_sucursal);

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
										//Otra sucursal
										if(FUN_TIPO_MODELO=='1' || FUN_TIPO_MODELO=='5')
										{
											VerGraficoSensorTermico(true,FUN_ID_CLIENTE,FUN_NOMBRE_CLIENTE,FUN_ID_SUCURSAL,FUN_NOMBRE_SUCURSAL,FUN_ID_SECCION,FUN_NOMBRE_SECCION,FUN_ID_EQUIPO,FUN_NOMBRE_EQUIPO,FUN_ID_SENSOR,FUN_TIPO_MODELO);
										}
										if(FUN_TIPO_MODELO=='2')
										{
											VerSensorElectrico(true,FUN_ID_SENSOR,FUN_NOMBRE_EQUIPO);
										}
										if(FUN_TIPO_MODELO=='6')
										{
											VerSensorSoloPuerta(true,FUN_ID_CLIENTE,FUN_NOMBRE_CLIENTE,FUN_ID_SUCURSAL,FUN_NOMBRE_SUCURSAL,FUN_ID_SECCION,FUN_NOMBRE_SECCION,FUN_ID_EQUIPO,FUN_NOMBRE_EQUIPO,FUN_ID_SENSOR,FUN_TIPO_MODELO);
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
	navigator.splashscreen.show();
	$('#DivIngresar').hide();
	$(window).disablescroll();

	var ID_CLIENTE;
	var ID_SUCURSAL;
	var NOMBRESUCURSAL;
	var ESTADO="";
	var LOGO_CLIENTE="";
	BD_APP = window.sqlitePlugin.openDatabase({name: "ingetrace.db", location: 'default'});

	BD_APP.transaction(function(tx) {
		tx.executeSql('SELECT json_sucursal FROM tbl_datos', [], function(tx, rs) {

			var Valor=""+rs.rows.item(0).json_sucursal;
			Valor=Base64.decode(Valor);

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
							setTimeout(function () {
								if(MOSTRAR_MENSAJE_NOTIFICACION)
								{
									MOSTRAR_MENSAJE_NOTIFICACION=false;
									MensajeAlerta(TITULO_NOTIFICACION,MENSAJE_NOTIFICACION);
								}
							}, 500);
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

		}, function(tx, error) {
			alert("ERROR : "+error.message);
		});
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
function MostrarModalNotificacionP1()
{
	$("#MensajeErrorTexto").html();
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
	
	FCMPlugin.getToken(function(token){
		alert(token);
		ActualizarToken(token);
	});

	$.post(RUTACONTROL,{
		accion: "login",
		Uss: $("#txtUsuario").val(),
		Pass: $("#txtContrasena").val(),
		Id_device: $("#H_TEXT_DEVICE").html(),
		Plataforma: DEVICEPLATFORM
	},function(response) {
		var json = jQuery.parseJSON(response);
		$.each(json, function(i, d) {
			if(d.ESTADO=="S")
			{
				//Cookie
				setCK(''+d.CK);
				setJsonSucursal(d.ID_CLIENTE,d.ID_SUC,response);
				//setIdDevice($("#H_TEXT_DEVICE").html());

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
function GetLimitesPuerta(Datos)
{
	var LimitesPuerta = new Array();

	for (i = 0; i < Datos.length; i++) {
		//Recorrer todos menos el ultimo
		if((i+1)!= Datos.length)
		{
			//Saber si es punultimo
			if((i+1)==(Datos.length-1))
			{
				var plot= GenararOpcionesPuerta(i,Datos);
				LimitesPuerta.push(plot);
				break;
			}
			else
			{
				var plot= GenararOpcionesPuerta(i,Datos);
				LimitesPuerta.push(plot);
			}
		}
	}
	return LimitesPuerta;
}
function GenararOpcionesPuerta(i,jsonPuerta)
{
	var MesMenos1=parseInt(jsonPuerta[i]['FechaHora'].substring(5, 7))-1;
	var MesMenos1Siguiente=parseInt(jsonPuerta[i+1]['FechaHora'].substring(5, 7))-1;

	var ColorArea='';
	if(jsonPuerta[i]['Estado']=='Closed')
	{
		ColorArea='#eeffee';
	}
	else
	{
		ColorArea='#ffdbdb';
	}

	var plot= {// mark the weekend
		color: ColorArea,
		from: Date.UTC(parseInt(jsonPuerta[i]['FechaHora'].substring(0, 4)),MesMenos1,parseInt(jsonPuerta[i]['FechaHora'].substring(8, 10)),parseInt(jsonPuerta[i]['FechaHora'].substring(11, 13)),parseInt(jsonPuerta[i]['FechaHora'].substring(14, 16)),parseInt(jsonPuerta[i]['FechaHora'].substring(17, 19))),
		to: Date.UTC(parseInt(jsonPuerta[i+1]['FechaHora'].substring(0, 4)),MesMenos1Siguiente,parseInt(jsonPuerta[i+1]['FechaHora'].substring(8, 10)),parseInt(jsonPuerta[i+1]['FechaHora'].substring(11, 13)),parseInt(jsonPuerta[i+1]['FechaHora'].substring(14, 16)),parseInt(jsonPuerta[i+1]['FechaHora'].substring(17, 19)))
	};

	return plot;
}
function ValidarFechasOperaciones(FechaInicio,FechaTermino)
{
	var Valido=false;
	var Respuesta="";

	var startDate = FechaInicio;
	startDate=String(startDate);

	//Convertiendo a float
	var anioIni=startDate.substring(6, 10);
	var mesIni=startDate.substring(3, 5);
	var diaIni=startDate.substring(0, 2);

	var FecIni = parseFloat(anioIni+mesIni+diaIni);

	var endDate = FechaTermino;
	endDate=String(endDate);

	//Convertiendo a float
	var anioFin=endDate.substring(6, 10);
	var mesFin=endDate.substring(3, 5);
	var diaFin=endDate.substring(0, 2);

	var FecFin = parseFloat(anioFin+mesFin+diaFin);

	if(FecIni!=FecFin)
	{
		if(FecIni < FecFin)
		{
			Valido=true;
			Respuesta="ok";
		}
		else
		{
			Respuesta="intervalo";
		}
	}
	else
	{
		Valido=true;
		Respuesta="ok";
	}
	
	if(Valido)
	{
		var fechaInicio = new Date(anioIni+'-'+mesIni+'-'+diaIni).getTime();
		var fechaFin    = new Date(anioFin+'-'+mesFin+'-'+diaFin).getTime();
		var diff = fechaFin - fechaInicio;
		var Dif=diff/(1000*60*60*24);
			
		if(Dif>7)
		{
			Valido=false;
			Respuesta="exceso";
		}
	}

	return Respuesta;
}