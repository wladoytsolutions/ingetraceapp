var Colores=['#7cb5ec', '#434348', '#90ed7d', '#f7a35c', '#8085e9', '#f15c80', '#e4d354', '#2b908f', '#f45b5b', '#91e8e1','#058DC7', '#50B432', '#ED561B', '#DDDF00', '#24CBE5', '#64E572', '#FF9655', '#FFF263', '#6AF9C4'];

Highcharts.setOptions({
	lang: {
		months: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
		weekdays: ['Domingo', 'Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado'],
		shortMonths: ['Ene' , 'Feb' , 'Mar' , 'Abr' , 'May' , 'Jun' , 'Jul' , 'Agost' , 'Sep' , 'Oct' , 'Nov' , 'Dic'],
		downloadJPEG:'Descargar JPEG',
		downloadPDF:'Descargar PDF',
		downloadPNG:'Descargar PNG',
		downloadSVG:'Descargar SVG',
		loading:'Cargando...',
		printChart:'Imprimir Gráfico',
		decimalPoint: ',',
		thousandsSep: '.',
		resetZoom: 'Restablecer'
	},
    colors: Colores
});

var chart;

$( document ).ready(function() {

	setInterval(function(){ ParpadearAlarmaLocal(); }, 1000);

	$("#ModalPage2").load("html_parts/modal_cargando.html");

	document.addEventListener("backbutton", function(e){
    if($.mobile.activePage.is('#p2')){
        //e.preventDefault();
        navigator.app.exitApp();
    }}, false);

	if (window.history && window.history.pushState) {
		window.history.pushState('forward', null, '');
		$(window).on('popstate', function() {
			var pagina = $.mobile.activePage.attr('id');
			if(pagina=="p2")
			{
				window.history.forward();
			}
        });
    }
	var temporizadorDashboard;

	temporizadorDashboard=setInterval(function(){ActualizarDashboard()},180000);
});
function ScrollContenedor(Id_sensor)
{
	var AltMenu=$('#DivMenu').height();
	var TopContendor=$('#Contenedor_'+Id_sensor+'').offset().top;
	var NuevoScrollTop=TopContendor+AltMenu;

	NuevoScrollTop=NuevoScrollTop-55;

	$('html, body').animate({
		scrollTop: NuevoScrollTop
	}, 250);
}
function CargarGraficoSensorTermico(event,IdCliente,NombreCliente,IdSucursal,NombreSucursal,IdSeccion,NombreSeccion,IdEquipo,NombreEquipo,IdSensor,TipoModelo)
{
	event.preventDefault();
	VerGraficoSensorTermico(false,IdCliente,NombreCliente,IdSucursal,NombreSucursal,IdSeccion,NombreSeccion,IdEquipo,NombreEquipo,IdSensor,TipoModelo);
}
function CargarGraficoSensorElectrico(event,IdSensor,NombreEquipo)
{
	event.preventDefault();
	VerSensorElectrico(false,IdSensor,NombreEquipo);
}
function CargarSensorSoloPuerta(event,IdCliente,NombreCliente,IdSucursal,NombreSucursal,IdSeccion,NombreSeccion,IdEquipo,NombreEquipo,IdSensor,TipoModelo)
{
	event.preventDefault();
	VerSensorSoloPuerta(false,IdCliente,NombreCliente,IdSucursal,NombreSucursal,IdSeccion,NombreSeccion,IdEquipo,NombreEquipo,IdSensor,TipoModelo);
}
function CargarAlarmaSensor(Id_cliente,Razon_social,Id_sucursal,Nombre_sucursal,Id_seccion, Nombre_seccion, Id_equipo, Nombre_equipo,Id_sensor,Tipo)
{
	$('#ModalPage2').popup('open', {
		transition: 'pop'
	});
	$(window).disablescroll();

	$("#H_ID_CLIENTE_ACTUAL").val(Id_cliente);
	$("#H_ID_SUCURSAL_ACTUAL").val(Id_sucursal);
	$("#H_ID_SECCION").val(Id_seccion);
	$("#H_ID_EQUIPO").val(Id_equipo);
	$("#H_ID_SENSOR").val(Id_sensor);
	$('#H_TIPO_MODELO').val(Tipo);

	$("#p3Body").load(
		"sensor.html",
	function() {
		$("#RowContenidoCuerpoP3").load(
			"html_parts/modal_alarmasSensor.html",
		function() {
			$('#H_SENSOR_ELECTRICO').val(Id_sensor);
			$("#TituloModalGrafico").html(Razon_social+' - '+Nombre_sucursal+' - '+Nombre_equipo+'('+Id_sensor+')');

			var CuerpoDatos='';

				$.post(RUTACONTROL,{
								accion 			 : 'UltimasAlarmas_Equipo_Sensor',
								ID_CLIENTE  	 : Id_cliente,
								RAZON_SOCIAL	 : Razon_social,
								ID_SUCURSAL		 : Id_sucursal,
								NOMBRE_SUCURSAL	 : Nombre_sucursal,
								ID_SECCION		 : Id_seccion,
								NOMBRE_SECCION   : Nombre_seccion,
								ID_EQUIPO		 : Id_equipo,
								NOMBRE_EQUIPO	 : Nombre_equipo,
								ID_SENSOR		 : Id_sensor,
								TIPO			 : Tipo
								},
				function(response) {
							var json = jQuery.parseJSON(response);
							CuerpoAlarmas=GenerarTablaDeAlertas(json);
							$("#tBodyDatosAlarmas").html(CuerpoAlarmas);

							$.mobile.pageContainer.pagecontainer('change', '#p3', {
								transition: 'flip',
								changeHash: true,
								reverse: true,
								showLoadMsg: false
							});

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
					$('#ModalPage2').popup('close');
					$(window).disablescroll("undo");
					setTimeout(function () {
						$("#TablaDatosAlarmas").dataTable({
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
						setTimeout(function () {
							RecargarTablaAlarmas();
						}, 250);
					}, 750);
				});
		});
	});
}
function CargarTodasLasAlarmas(event)
{
	event.preventDefault();

	var CuerpoDatos='';

	$('#ModalCargandoAlarma').popup('open', {
		transition: 'pop'
	});

	$('#TablaDatosAlarmas').dataTable().fnDestroy();
	$('#tBodyDatosAlarmas').html("");

	$.post(RUTACONTROL,{
						accion 			 : 'Alarmas_Equipo_Sensor',
						ID_CLIENTE  	 : $("#H_ID_CLIENTE_ACTUAL").val(),
						ID_SUCURSAL		 : $("#H_ID_SUCURSAL_ACTUAL").val(),
						ID_SECCION		 : $("#H_ID_SECCION").val(),
						ID_EQUIPO		 : $("#H_ID_EQUIPO").val(),
						ID_SENSOR		 : $("#H_ID_SENSOR").val(),
						TIPO		 	 : $('#H_TIPO_MODELO').val()
	}, function(response) {
		var json = jQuery.parseJSON(response);
		CuerpoDatos=GenerarTablaDeAlertas(json);
		$("#tBodyDatosAlarmas").html(CuerpoDatos);
	}).done(function(response) {
		$(window).disablescroll("undo");
		setTimeout(function () {
			$("#TablaDatosAlarmas").dataTable({
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
			setTimeout(function () {
				RecargarTablaAlarmas();
			}, 250);

			$('#ModalCargandoAlarma').popup('close');
		}, 750);
	});
}
function CerrarModalGrafico(event)
{
	event.preventDefault();
	$.mobile.pageContainer.pagecontainer('change', '#p2', {
				transition: 'flip',
				changeHash: false,
				reverse: false,
				showLoadMsg: false
	});
}
function ActualizarDashboard()
{
	var json;
	var EstadoSucursal='';
	var IconoSucursal='';

	$.post(RUTACONTROL,{
										accion		: 'ACTUALIZA_SENSORES',
										CK			: getCK(),
										ID_CLIENTE	: $('#H_ID_CLIENTE_ACTUAL').val(),
										ID_SUC		: $('#H_ID_SUCURSAL_ACTUAL').val()
									 },
			function(response) {

			json = jQuery.parseJSON(response);

			EstadoSucursal=''+json.ESTADO_SUCURSAL;
			IconoSucursal=''+json.ICONO_SUCURSAL;

	}).done(function(response) {
		$("#Estado_Sucursal").html(EstadoSucursal);
		$("#IconoSucursal").html(IconoSucursal);

		$.each(json.SENSORES, function(i, d) {

			$("#SENAL_"+d.IDSENSOR+"").html(d.SENAL);

			var BanderaAlerta=false;

			if(d.TIPO_SENSOR=="Termico" || d.TIPO_SENSOR=="Humedad")
			{
				//ALARMA TEMPERATURA
				if($.trim($("#Cont_Alarma_Temp_"+d.IDSENSOR+"").html())!=$.trim(d.ALARMA))
				{
					$("#Cont_Alarma_Temp_"+d.IDSENSOR+"").html(d.ALARMA);
					ParpadearActualizar("Cont_Alarma_Temp_"+d.IDSENSOR+"");
				}

				//ALARMA HUMEDAD
				if($.trim($("#Cont_Alarma_Humedad_"+d.IDSENSOR+"").html())!=$.trim(d.HMD_ULT_ALARMA))
				{
					$("#Cont_Alarma_Humedad_"+d.IDSENSOR+"").html(d.HMD_ULT_ALARMA);
					ParpadearActualizar("Cont_Alarma_Humedad_"+d.IDSENSOR+"");
				}

				if($.trim(d.STATUS_EQUIPO)=='')
				{
					$('#IconoSensor_'+d.IDSENSOR+'').html('<i class="glyphicon glyphicon-ok-circle" style="color: #08fa06"></i>');
					$('#Temp_'+d.IDSENSOR+'').css('color','');
					$('#Temp_'+d.IDSENSOR+'').attr('class','no-margins Cifras');
					$('#Temp_'+d.IDSENSOR+'').unbind();
				}
				else
				{
					BanderaAlerta=true;
					$('#IconoSensor_'+d.IDSENSOR+'').html('<i class="glyphicon glyphicon-remove-circle parpadear" style="color: #fd0002"></i>');
					$('#Temp_'+d.IDSENSOR+'').css('color','#fd0002');
					$('#Temp_'+d.IDSENSOR+'').attr('class','no-margins Cifras parpadear');
				}

				if($("#Hora_"+d.IDSENSOR+"").html()!=d.HORA)
				{
					var IconoTendencia='';
					var ColorTendencia='';

					//Validando TENDENCIA en Iconos
					if(d.TENDENCIA=="=")
					{
						IconoTendencia='-';
						ColorTendencia='#f0ad4e';
					}
					//BAJA
					if(d.TENDENCIA=="-")
					{
						IconoTendencia='↓';
						ColorTendencia='#5cb85c';
					}
					//SUBE
					if(d.TENDENCIA=="+")
					{
						IconoTendencia='↑';
						ColorTendencia='#d9534f';
					}

					//alert(TemperaturaAnterior+" VS "+TemperaturaActual+" --> "+IconoTendencia);

					$('#Temp_'+d.IDSENSOR+'').html(d.TEMPERATURA+'<span id="ICON_TENDENCIA_'+d.IDSENSOR+'" style="float: right; margin-left: -4px; margin-top: -4px;"></span>');
					$("#ICON_TENDENCIA_"+d.IDSENSOR+"").html(" "+IconoTendencia);
					$('#ICON_TENDENCIA_'+d.IDSENSOR+'').css('color',ColorTendencia);
					$("#Hora_"+d.IDSENSOR+"").html(d.HORA);
					ParpadearActualizar("Temp_"+d.IDSENSOR+"");
					ParpadearActualizar("Hora_"+d.IDSENSOR+"");
				}
				//TEMP MINIMA
				if($("#TempMin_"+d.IDSENSOR+"").html()!=d.MINIMA)
				{
					$("#TempMin_"+d.IDSENSOR+"").html(d.MINIMA);
					ParpadearActualizar("TempMin_"+d.IDSENSOR+"");
				}

				//TEMP MAXIMA
				if($("#TempMax_"+d.IDSENSOR+"").html()!=d.MAXIMA)
				{
					$("#TempMax_"+d.IDSENSOR+"").html(d.MAXIMA);
					ParpadearActualizar("TempMax_"+d.IDSENSOR+"");
				}

				//HORA MINIMA
				if($("#HORA_MINIMA_"+d.IDSENSOR+"").html()!=d.HORA_MINIMA)
				{
					$("#HORA_MINIMA_"+d.IDSENSOR+"").html(d.HORA_MINIMA);
					ParpadearActualizar("HORA_MINIMA_"+d.IDSENSOR+"");
				}

				//HORA MAXIMA
				if($("#HORA_MAXIMA_"+d.IDSENSOR+"").html()!=d.HORA_MAXIMA)
				{
					$("#HORA_MAXIMA_"+d.IDSENSOR+"").html(d.HORA_MAXIMA);
					ParpadearActualizar("HORA_MAXIMA_"+d.IDSENSOR+"");
				}

				//#SI ES HUMEDAD#//
				if(d.TIPO_SENSOR=="Humedad")
				{
					$("#HMD_SENAL_"+d.IDSENSOR+"").html(d.SENAL);

					if($.trim(d.STATUS_EQUIPO_HMD)=='')
					{
						if(!BanderaAlerta)
						{
							$('#IconoSensor_'+d.IDSENSOR+'').html('<i class="glyphicon glyphicon-ok-circle" style="color: #08fa06"></i>');
						}
						$('#Humedad_'+d.IDSENSOR+'').css('color','');
						$('#Humedad_'+d.IDSENSOR+'').attr('class','Cifras no-margins');
						$('#Humedad_'+d.IDSENSOR+'').unbind();
					}
					else
					{
						$('#IconoSensor_'+d.IDSENSOR+'').html('<i class="glyphicon glyphicon-remove-circle parpadear" style="color: #fd0002"></i>');
						$('#Humedad_'+d.IDSENSOR+'').css('color','#fd0002');
						$('#Humedad_'+d.IDSENSOR+'').attr('class','no-margins Cifras parpadear');
					}

					if($("#HMD_Hora_"+d.IDSENSOR+"").html()!=d.HMD_HORA)
					{
						var IconoTendencia='';
						var ColorTendencia='';

						//Validando TENDENCIA en Iconos
						if(d.HMD_TENDENCIA=="=")
						{
							IconoTendencia='-';
							ColorTendencia='#f0ad4e';
						}
						//BAJA
						if(d.HMD_TENDENCIA=="-")
						{
							IconoTendencia='↓';
							ColorTendencia='#5cb85c';
						}
						//SUBE
						if(d.HMD_TENDENCIA=="+")
						{
							IconoTendencia='↑';
							ColorTendencia='#d9534f';
						}

						//alert(TemperaturaAnterior+" VS "+TemperaturaActual+" --> "+IconoTendencia);

						$('#Humedad_'+d.IDSENSOR+'').html(d.HUMEDAD+'%<span id="HMD_ICON_TENDENCIA_'+d.IDSENSOR+'" style="float: right; margin-left: -4px; margin-top: -4px;"></span>');
						$("#HMD_ICON_TENDENCIA_"+d.IDSENSOR+"").html(" "+IconoTendencia);
						$('#HMD_ICON_TENDENCIA_'+d.IDSENSOR+'').css('color',ColorTendencia);
						$("#HMD_Hora_"+d.IDSENSOR+"").html(d.HMD_HORA);
						ParpadearActualizar("Humedad_"+d.IDSENSOR+"");
						ParpadearActualizar("HMD_Hora_"+d.IDSENSOR+"");
					}
					//HMD MINIMA
					if($("#HMD_Min_"+d.IDSENSOR+"").html()!=(d.HMD_MINIMA+"%"))
					{
						$("#HMD_Min_"+d.IDSENSOR+"").html(d.HMD_MINIMA+"%");
						ParpadearActualizar("HMD_Min_"+d.IDSENSOR+"");
					}
					//HMD MAXIMA
					if($("#HMD_Max_"+d.IDSENSOR+"").html()!=(d.HMD_MAXIMA+"%"))
					{
						$("#HMD_Max_"+d.IDSENSOR+"").html(d.HMD_MAXIMA+"%");
						ParpadearActualizar("HMD_Max_"+d.IDSENSOR+"");
					}

					//HORA MINIMA
					if($("#HMD_HORA_MINIMA_"+d.IDSENSOR+"").html()!=d.HMD_HORA_MINIMA)
					{
						$("#HMD_HORA_MINIMA_"+d.IDSENSOR+"").html(d.HMD_HORA_MINIMA);
						ParpadearActualizar("HMD_HORA_MINIMA_"+d.IDSENSOR+"");
					}

					//HORA MAXIMA
					if($("#HMD_HORA_MAXIMA_"+d.IDSENSOR+"").html()!=d.HMD_HORA_MAXIMA)
					{
						$("#HMD_HORA_MAXIMA_"+d.IDSENSOR+"").html(d.HMD_HORA_MAXIMA);
						ParpadearActualizar("HMD_HORA_MAXIMA_"+d.IDSENSOR+"");
					}
				}
				//Saber si tiene puerta
				if(d.ID_SENSOR_PUERTA!="")
				{
					if($("#PUERTA_"+d.ID_SENSOR_PUERTA+"").html()!=d.PUERTA)
					{
						$("#PUERTA_"+d.ID_SENSOR_PUERTA+"").html(d.PUERTA);
						ParpadearActualizar("PUERTA_"+d.ID_SENSOR_PUERTA+"");
					}
				}
			}
			if(d.TIPO_SENSOR=="Electrico")
			{

				var Desde=$("#Desde_"+d.IDSENSOR+"").html()+"";
				var FechaHora=d.FECHA_HORA+"";

				if(Desde != FechaHora){

					var Alarma='#08fa06';

					if(d.ACCION=="Open")
					{
						Alarma='#fd0002';
					}

					var Icono='<i style="color: '+Alarma+'" class="glyphicon glyphicon-off"></i>';

					//Tr_Electrico_   ACCION
					$("#Estado_"+d.IDSENSOR+"").html(Icono);
					$("#Desde_"+d.IDSENSOR+"").html(d.FECHA_HORA);

					ParpadearActualizar("Estado_"+d.IDSENSOR+"");
					ParpadearActualizar("Desde_"+d.IDSENSOR+"");

				}
			}
		});
	});
}
function ParpadearActualizar(Id_contenedor)
{
	$("#"+Id_contenedor+"").fadeOut(500);
	$("#"+Id_contenedor+"").fadeIn(500);
	$("#"+Id_contenedor+"").fadeOut(500);
	$("#"+Id_contenedor+"").fadeIn(500);
	$("#"+Id_contenedor+"").fadeOut(500);
	$("#"+Id_contenedor+"").fadeIn(500);
}
function ParpadearAlarmaLocal()
{
	$(".parpadear").fadeOut(500);
	$(".parpadear").fadeIn(500);
}
function GenerarTablaDeAlertas(json)
{
	var CuerpoAlarmas='';

	if($('#H_TIPO_MODELO').val()=="5")
	{
		$('#Th_HMD').show();
	}

	$.each(json, function(i, d) {
		$("#FechaBitacoraHoy").html(d.FECHA_HOY);

		//Recorriendo alertas
		$.each(d.ALERTAS, function(j, e) {
			CuerpoAlarmas+='<tr style="text-align: center; cursor:pointer" onclick="javascript:CargarBitacora('+e.Id_alerta+');">';
			CuerpoAlarmas+='<td width="38%">'+e.Id_alerta+'</td>';
			CuerpoAlarmas+='<td><span style="display:none">'+e.Fecha_Numerica+'</span>'+e.Fecha_Hora+'</td>';
			CuerpoAlarmas+='<td width="20%">'+e.TipoAlerta+'</td>';

			if($('#H_TIPO_MODELO').val() == "5")
			{
				if(e.Tipo_modelo=="1")
				{
					CuerpoAlarmas+='<td width="9%"><label class="LabelAlarma">'+e.temperatura+'</label></td>';
				}
				else
				{
					CuerpoAlarmas+='<td width="9%">'+e.temperatura+'</td>';
				}
			}
			else
			{
				CuerpoAlarmas+='<td width="9%">'+e.temperatura+'</td>';
			}

			//Si es tipo temperatura humedad
			if($('#H_TIPO_MODELO').val() == "5")
			{
				if(e.Tipo_modelo=="5")
				{
					CuerpoAlarmas+='<td width="9%"><label class="LabelAlarma">'+e.humedad+'</label></td>';
				}
				else
				{
					CuerpoAlarmas+='<td width="9%">'+e.humedad+'</td>';
				}
			}
			else
			{
				CuerpoAlarmas+='<td width="9%" style="display:none">'+e.humedad+'</td>';
			}
			CuerpoAlarmas+='</tr>';
		});
	});
	return CuerpoAlarmas;
}
function VolverAtras(event)
{
	event.preventDefault();
	$.mobile.pageContainer.pagecontainer('change', '#p2', {
		transition: 'flip',
		changeHash: true,
		reverse: false,
		showLoadMsg: false
	});
	setTimeout(function () {
		ScrollContenedor($('#H_ID_SENSOR').val());
	},500);
}
