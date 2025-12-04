public with sharing class EthicsRequestPathController {

    public class StatusConfig {
        @AuraEnabled public String status;
        @AuraEnabled public String guidance;
        @AuraEnabled public Integer sortOrder;
    }

    @AuraEnabled(cacheable=true)
    public static List<StatusConfig> getStatusConfig() {
        List<StatusConfig> result = new List<StatusConfig>();

        for (L_BAU_HumanEthics_GS__mdt cm : [
            SELECT Status_Value__c, Guidance__c, Sort_Order__c
            FROM L_BAU_HumanEthics_GS__mdt
            ORDER BY Sort_Order__c, Status_Value__c
        ]) {
            StatusConfig cfg = new StatusConfig();
            cfg.status   = cm.Status_Value__c;
            cfg.guidance = cm.Guidance__c;
            //cfg.sortOrder = cm.Sort_Order__c;
            result.add(cfg);
        }
        return result;
    }
}