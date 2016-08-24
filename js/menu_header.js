$( document ).ready(function() {
   	$("#LinkClienteSucursal").click(function(e) {
		e.preventDefault();
		CambiarClienteSucursal();
		$('#btnMenuMobil').trigger( "click" );
	});
	$("#LinkCambiarPass").click(function(e) {
		e.preventDefault();
		CambiarClave();
		$('#btnMenuMobil').trigger( "click" );
	});	
	$("#LinkLogout").click(function(e) {
		e.preventDefault();
		Logout();
	});
	
	$("#btnCancelarCambioSuc").click(function(e) {
		e.preventDefault();	
		$('#ModalCambioSuc3').popup( "close" );
	});
	$("#btnCancelarCambioClave").click(function(e) {
		e.preventDefault();	
		$('#ModalClave3').popup( "close" );
	});
	
	setTimeout(function () {
		$('#Cbo_Cliente-button').attr('class','');
		$('#Cbo_Sucursal-button').attr('class','');
	}, 500);
	
	$("#btn_aceptarCambioSuc").click(function(e) {
		e.preventDefault();
		$('#ModalCambioSuc3').popup( "close" );
		
		setTimeout(function () {
			CambiarSucursal();
		}, 250);
	});
	$("#btn_aceptarCambioClave").click(function(e) {
		e.preventDefault();
		$('#btnValidarCambioClave').trigger("click");
		if(formularioCambioClave.checkValidity()){
			if($('#txtContrasena1').val()==$('#txtContrasena2').val())
			{
				CambiarClaveBD();
			}
			else
			{
				$('#msjeCambioClave').html("Las contraseñas deben coincidir");
				$('#alertMensajeCambioClave').show();
			}
		}
	});
	
});
function Logout()
{
	// Devuelve true cuando se encuentra el cookie
	setCookie('INGSCE_INF','',0);
	// Misma ruta que hemos puesto para escribir el cookie...	
	window.location.href = "index.html";
}
function CambiarClienteSucursal()
{
	if($('#H_CARGA_CAMBIO_CLISUC').val()=='0')
	{
		var ID_CLIENTE_ACTUAL='';
		var OpcionesClientes='';
		
		$(window).disablescroll();
		$('#ModalPage2').popup('open', {
			transition: 'pop'
		});
		
		$.post(RUTACONTROL,{
							accion		: 'GetClientesSucursales',
							CK			: ''+getCookie('INGSCE_INF')
							}, 
		function(response) {
			
			JSON_CLIENTES_SUCURSALES = jQuery.parseJSON(response);
			
			//Combobox Cliente
			$('#Cbo_Cliente').change(function(e) {
				e.preventDefault();
				var Id_cliente=$('#Cbo_Cliente').val();		
				$("#Cbo_Sucursal").prop("disabled", true);
				
				var Opciones='';
				
				$.each(JSON_CLIENTES_SUCURSALES, function(i, d) {
					if(d.Id_cliente==Id_cliente)
					{
						Opciones+='<option value="'+d.Id_sucursal+'">'+d.Nombre+'</option>';
					}
				});
				
				$('#Cbo_Sucursal').html(Opciones);
				$("#Cbo_Sucursal").prop("disabled", false);
				
			});
			
			$.each(JSON_CLIENTES_SUCURSALES, function(i, d) {
				if(d.Id_cliente!=ID_CLIENTE_ACTUAL)
				{
					if($.trim($('#H_ID_CLIENTE_ACTUAL').val())=="")
					{
						$('#H_ID_CLIENTE_ACTUAL').val(d.Id_cliente);
					}
					
					OpcionesClientes+='<option value="'+d.Id_cliente+'">'+d.RazonSocial+'</option>';
					ID_CLIENTE_ACTUAL=d.Id_cliente;
				}
			});
			
			$('#CboAux_Cliente').html(OpcionesClientes);
			$('#Cbo_Cliente').html(OpcionesClientes);
			$('#Cbo_Cliente').val($('#H_ID_CLIENTE_ACTUAL').val());
			
			//OpcionesSucursal
			var OpcionesSucursal='';
			$.each(JSON_CLIENTES_SUCURSALES, function(i, d) {
				if(d.Id_cliente==$('#H_ID_CLIENTE_ACTUAL').val())
				{
					if($.trim($('#H_ID_SUCURSAL_ACTUAL').val())=="")
					{
						$('#H_ID_SUCURSAL_ACTUAL').val(d.Id_sucursal);
					}
					
					OpcionesSucursal+='<option value="'+d.Id_sucursal+'">'+d.Nombre+'</option>';
				}
			});
				
			$('#CboAux_Sucursal').html(OpcionesSucursal);
			$('#Cbo_Sucursal').html(OpcionesSucursal);
			$('#Cbo_Sucursal').val($('#H_ID_SUCURSAL_ACTUAL').val());
			
		}).done(function(response) {
			$('#H_CARGA_CAMBIO_CLISUC').val('1');
			$('#ModalPage2').popup("close");
			
			$(window).disablescroll("undo");
			
			setTimeout(function () {
				$('#ModalCambioSuc3').popup('open', {
					transition: 'pop'
				});
			}, 500);
		});
	}
	else
	{
		$('#ModalCambioSuc3').popup('open', {
			transition: 'pop'
		});
	}
}
function CambiarClave()
{
	$('#ModalClave3').popup('open', {
		transition: 'pop'
	});
}
function CambiarSucursal()
{
	$('#ModalPage2').popup('open', {
		transition: 'pop'
	});
	$(window).disablescroll();
	
	$.post(RUTACONTROL,{
								accion: "CambiaSucursal",
								IdCliente: $("#Cbo_Cliente").val(),
								IdSucursal: $("#Cbo_Sucursal").val(),
								CK: ''+getCookie('INGSCE_INF')
								}, 
	function(response) {
		var json = jQuery.parseJSON(response);
		$.each(json, function(i, d) {
				//Cookie
				setCookie('INGSCE_INF',''+d.CK,7);
				
				//Estado de sucursal
				$("#Estado_Sucursal").html(d.ESTADOSUCURSAL);
				$("#IconoSucursal").html(d.ICONO_SUCURSAL);
				$("#NombreSucusal").html(d.NOMBRE_SUCURSAL_ACTUAL);
				LOGO_CLIENTE="http://www.ingetrace.cl/sct/img/logo/"+d.LOGO_CLIENTE;
				$("#LogoCliente").attr("src",LOGO_CLIENTE);	
				
				GenerarHTMLSensores(d);
		});
	}).done(function(response) {
		$('#ModalPage2').popup("close");
		$(window).disablescroll("undo");
		$('#H_ID_CLIENTE_ACTUAL').val($("#Cbo_Cliente").val());
		$('#H_ID_SUCURSAL_ACTUAL').val($("#Cbo_Sucursal").val());
		//$('#DivInicio').css('height',$( window ).height()+'px');
	});
}
function CambiarClaveBD()
{
	$('#alertMensajeCambioClave').hide();
	$('#msjeCambioClave').html("");	
	
	$('#RowOpcionesCambioClave').hide();
	$('#DivConfirmarContraseña1').hide("fade");	
	$('#DivConfirmarContraseña2').hide("fade");	
	$('#Modal_cargandoCambioClave').show('fade');
	
	$("#txtContrasena1").prop("disabled", true);
	$("#txtContrasena2").prop("disabled", true);
	$("#txtContraseñaActual").prop("disabled", true);
	
	
	$(window).disablescroll();
	
	$.post(RUTACONTROL,{
								accion: "CambioClave",
								CK: ''+getCookie('INGSCE_INF'),
								Pass: $("#txtContrasena1").val(),
								PassActual: $("#txtContraseñaActual").val()
								}, 
	function(response) {
		var json = jQuery.parseJSON(response);
		$.each(json, function(i, d) {
			if(d.RESULTADO=="Ok")
			{
				$('#msjeCambioClave').html(d.MENSAJE);
				$('#alertMensajeCambioClave').show();
				$("#txtContrasena1").val("");
				$("#txtContrasena2").val("");
				$("#txtContraseñaActual").val("");
			}
			if(d.RESULTADO=="Error")
			{
				$('#msjeCambioClave').html(d.MENSAJE);
				$('#alertMensajeCambioClave').show();
			}
		});
	}).done(function(response) {
		$("#txtContrasena1").prop("disabled", false);
		$("#txtContrasena2").prop("disabled", false);
		$("#txtContraseñaActual").prop("disabled", false);
		
		$('#Modal_cargandoCambioClave').hide('fade');
		$('#RowOpcionesCambioClave').show();
		$('#DivConfirmarContraseña1').show("fade");	
		$('#DivConfirmarContraseña2').show("fade");	
	});
}