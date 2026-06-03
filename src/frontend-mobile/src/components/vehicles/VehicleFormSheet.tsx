import { useEffect, useState } from "react";
import { Alert, Text, View } from "react-native";

import { Button } from "../ui/Button";
import { FormSheet } from "../ui/FormSheet";
import { Input } from "../ui/Input";
import { useAuthorizedToken } from "../../hooks/useAuthorizedToken";
import { vehicleModule, type Vehicle } from "../../core/modules/vehicles/vehicles";
import { notifySuccess, showToast } from "../ui/toast";
import { FALLBACK_VEHICLE_IMAGE } from "../../utils/vehicleImage";
import { validateVehicleForm } from "../../utils/vehicleValidation";

type Props = {
  visible: boolean;
  vehicle: Vehicle | null;
  onClose: () => void;
  onSaved: () => void;
};

export function VehicleFormSheet({ visible, vehicle, onClose, onSaved }: Props) {
  const getToken = useAuthorizedToken();
  const isEdit = Boolean(vehicle);
  const [marca, setMarca] = useState("");
  const [modelo, setModelo] = useState("");
  const [ano, setAno] = useState("");
  const [placa, setPlaca] = useState("");
  const [fotoUrl, setFotoUrl] = useState(FALLBACK_VEHICLE_IMAGE);
  const [tamanhoTanque, setTamanhoTanque] = useState("");
  const [consumoMedio, setConsumoMedio] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!visible) return;
    if (vehicle) {
      setMarca(vehicle.marca);
      setModelo(vehicle.modelo);
      setAno(String(vehicle.ano));
      setPlaca(vehicle.placa);
      setFotoUrl(vehicle.fotoUrl || FALLBACK_VEHICLE_IMAGE);
      setTamanhoTanque(String(vehicle.tamanhoTanque));
      setConsumoMedio(String(vehicle.consumoMedio));
    } else {
      setMarca("");
      setModelo("");
      setAno("");
      setPlaca("");
      setFotoUrl(FALLBACK_VEHICLE_IMAGE);
      setTamanhoTanque("");
      setConsumoMedio("");
    }
  }, [visible, vehicle]);

  async function onSubmit() {
    const payload = {
      marca: marca.trim(),
      modelo: modelo.trim(),
      ano: Number(ano),
      placa: placa.trim().toUpperCase(),
      fotoUrl: fotoUrl.trim() || FALLBACK_VEHICLE_IMAGE,
      tamanhoTanque: Number(tamanhoTanque),
      consumoMedio: Number(consumoMedio),
    };

    const validationError = validateVehicleForm(payload);
    if (validationError) {
      showToast({ message: validationError, tone: "error" });
      return;
    }

    setSaving(true);
    try {
      const idToken = await getToken();
      if (isEdit && vehicle) {
        await vehicleModule.gateways.update.exec({
          idToken,
          vehicleId: vehicle.id,
          ...payload,
        });
      } else {
        await vehicleModule.gateways.create.exec({ idToken, ...payload });
      }
      notifySuccess(isEdit ? "Veículo atualizado com sucesso." : "Veículo cadastrado com sucesso.");
      onSaved();
      onClose();
    } catch {
      // Toast exibido pelo AxiosAdapter; mantém formulário aberto.
    } finally {
      setSaving(false);
    }
  }

  return (
    <FormSheet
      visible={visible}
      title={isEdit ? "Editar veículo" : "Novo veículo"}
      description="Cadastro alinhado ao painel web da frota."
      onClose={onClose}
      footer={
        <Button onPress={onSubmit} loading={saving}>
          {isEdit ? "Salvar alterações" : "Cadastrar veículo"}
        </Button>
      }
    >
      <View className="gap-y-4 pb-6">
        <Input label="Marca" nativeID="vehicle-marca" value={marca} onChangeText={setMarca} placeholder="Fiat" />
        <Input
          label="Modelo"
          nativeID="vehicle-modelo"
          value={modelo}
          onChangeText={setModelo}
          placeholder="Uno"
        />
        <Input
          label="Ano"
          nativeID="vehicle-ano"
          value={ano}
          onChangeText={setAno}
          keyboardType="number-pad"
          placeholder="2020"
        />
        <Input
          label="Placa"
          nativeID="vehicle-placa"
          value={placa}
          onChangeText={setPlaca}
          autoCapitalize="characters"
          placeholder="ABC1D23"
        />
        <Input
          label="URL da foto"
          nativeID="vehicle-fotoUrl"
          value={fotoUrl}
          onChangeText={setFotoUrl}
          autoCapitalize="none"
          placeholder="https://..."
        />
        <Input
          label="Tanque (L)"
          nativeID="vehicle-tamanhoTanque"
          value={tamanhoTanque}
          onChangeText={setTamanhoTanque}
          keyboardType="decimal-pad"
          placeholder="55"
        />
        <Input
          label="Consumo médio (km/L)"
          nativeID="vehicle-consumoMedio"
          value={consumoMedio}
          onChangeText={setConsumoMedio}
          keyboardType="decimal-pad"
          placeholder="12.5"
        />
      </View>
    </FormSheet>
  );
}

export function confirmDeleteVehicle(
  vehicle: Vehicle,
  onConfirm: () => void,
) {
  Alert.alert(
    "Excluir veículo",
    `Remover ${vehicle.marca} ${vehicle.modelo} (${vehicle.placa})?`,
    [
      { text: "Cancelar", style: "cancel" },
      { text: "Excluir", style: "destructive", onPress: onConfirm },
    ],
  );
}
