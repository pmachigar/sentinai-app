# --- Managed Identity for AKS (Principle of Least Privilege) ---
resource "azurerm_user_assigned_identity" "aks_identity" {
  name                = "${var.project_name}-aks-identity"
  resource_group_name = azurerm_resource_group.rg.name
  location            = azurerm_resource_group.rg.location
}

# --- Role Assignments ---

# Grant 'Azure Event Hubs Data Sender' to specific Event Hub ONLY 
resource "azurerm_role_assignment" "aks_eh_sender" {
  scope                = azurerm_eventhub.iot_telemetry.id
  role_definition_name = "Azure Event Hubs Data Sender"
  principal_id         = azurerm_user_assigned_identity.aks_identity.principal_id
}

# Example to grant explicit AcrPull to a specific Container Registry
# resource "azurerm_role_assignment" "aks_acr_pull" {
#   scope                = azurerm_container_registry.acr.id
#   role_definition_name = "AcrPull"
#   principal_id         = azurerm_user_assigned_identity.aks_identity.principal_id
# }
