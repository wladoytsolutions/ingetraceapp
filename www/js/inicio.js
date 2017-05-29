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

	$("#btn_Pruebas").click(function(e) {
		e.preventDefault();
	});
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
				$("#H_TIPO_MODELO").val(TipoModelo);

				//HTML CARGADO
				$.post(RUTACONTROL,
						{
							accion: 'DatosGraficoSensorTermico',
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
					optionsLineal=GenerarGraficoSensor(json);

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
function CargarGraficoSensorElectrico(event,IdSensor,NombreEquipo)
{
	event.preventDefault();

	$('#ModalPage2').popup('open', {
		transition: 'pop'
	});
	$(window).disablescroll();

	$("#H_ID_SENSOR").val(IdSensor);

	$("#p3Body").load(
		"sensor.html",
	function() {
		$("#RowContenidoCuerpoP3").load(
			"html_parts/modal_datosSensorElectrico.html",
		function() {
			$('#H_SENSOR_ELECTRICO').val(IdSensor);
			$("#TituloModalGrafico").html(NombreEquipo+'('+IdSensor+')');

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
							$("#termino_filtroDatosSensorElectrico").val(json['FECHA_HOY']);

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

							$("#tbl_DataGra").html($("#PanelBodyTablaDatosSensor").html());

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
							"bInfo"		:	false,
							"scrollCollapse": true,
							"paging":         false,
							"searching": false
						});
						setTimeout(function () {
							RecargarTabla();
						}, 500);
						$("#btn_buscarGrafico").prop('disabled', false);
					}, 750);
				});
		});
	});
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
	$("#H_TIPO_MODELO").val(Tipo);

	$("#p3Body").load(
		"sensor.html",
	function() {
		$("#RowContenidoCuerpoP3").load(
			"html_parts/modal_alarmasSensor.html",
		function() {
			$('#H_SENSOR_ELECTRICO').val(Id_sensor);
			$("#TituloModalGrafico").html(Razon_social+' - '+Nombre_sucursal+' - '+Nombre_equipo+'('+Id_sensor+')');
			var CuerpoAlarmas='';

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
										CK			: ''+getCookie('INGSCE_INF'),
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
						IconoTendencia='&#x2193;';
						ColorTendencia='#5cb85c';
					}
					//SUBE
					if(d.TENDENCIA=="+")
					{
						IconoTendencia='&#x2191;';
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
							IconoTendencia='&#x2193;';
							ColorTendencia='#5cb85c';
						}
						//SUBE
						if(d.HMD_TENDENCIA=="+")
						{
							IconoTendencia='&#x2191;';
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
		CargarMarquee();
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
function GenerarGraficoSensor(json)
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
							$("#inicio_filtroDatosSensor").val(e.FECHA_HOY);
							$("#termino_filtroDatosSensor").val(e.FECHA_HOY);

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
								dateTimeLabelFormats: { // don't display the dummy year
									second: '%H:%M:%S'
								}
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
							$("#termino_filtroDatosSensor").val(e.FECHA_HOY);

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
									useHTML: true,

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
								plotLines: [{
									//Promedio Temperatura
									value: Promedio,
									color: 'green',
									dashStyle: 'shortdash',
									width: 2,
									label: {
										text: 'Prom. Temp.'
									}
								},{
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
								},{
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
