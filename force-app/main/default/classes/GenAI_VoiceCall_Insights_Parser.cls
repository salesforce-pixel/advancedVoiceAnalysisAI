public class GenAI_VoiceCall_Insights_Parser {
    
    public class Request {
        @InvocableVariable(required=true)
        public String jsonInput;
        @InvocableVariable(required=true)
        public Id voiceCallId;
    }
    
    public class Result {
        @InvocableVariable
        public Boolean success;
        @InvocableVariable
        public String errorMessage;
    }

    @InvocableMethod(label='GenAI VoiceCall Insights Parser' description='Parses the JSON input and updates the VoiceCall record with insights.')
    public static List<Result> updateVoiceCalls(List<Request> requests) {
        List<Result> results = new List<Result>();
        List<VoiceCall> voiceCallsToUpdate = new List<VoiceCall>();

        for (Request req : requests) {
            Result result = new Result();
            result.success = true;

            try {
                String cleanedJsonInput = req.jsonInput
                    .replace('\n', ' ')
                    .replace('\\\\', '')
                    .replaceAll('\\u00A0', '')
                    .trim();

                Map<String, Object> jsonMap = (Map<String, Object>) JSON.deserializeUntyped(cleanedJsonInput);
                VoiceCall vc = new VoiceCall(Id = req.voiceCallId);
                if(cleanedJsonInput != null) vc.GenAI_Complete_Raw_Analysis__c = cleanedJsonInput;
                if (jsonMap.containsKey('CustomerSentiment')) vc.GenAI_Customer_Sentiment__c = (String) jsonMap.get('CustomerSentiment');
                if (jsonMap.containsKey('CallOutcome')) vc.GenAI_Call_Outcome__c = (String) jsonMap.get('CallOutcome');
                if (jsonMap.containsKey('Summary')) vc.GenAI_Call_Summary__c = (String) jsonMap.get('Summary');

                if (jsonMap.containsKey('TopicsDiscussed')) {
                    List<Object> topicsRaw = (List<Object>) jsonMap.get('TopicsDiscussed');
                    List<String> topics = new List<String>();
                    for (Object topic : topicsRaw) {
                        if (topic != null) topics.add(String.valueOf(topic));
                    }
                    vc.GenAI_Topics_Discussed__c = String.join(topics, ', ');
                }

                
                if (jsonMap.containsKey('NextSteps')) vc.GenAI_Next_Steps__c = (String) jsonMap.get('NextSteps');

                if (jsonMap.containsKey('RepEffectivenessScore')) {
                    Map<String, Object> scoreBlock = (Map<String, Object>) jsonMap.get('RepEffectivenessScore');
                    if (scoreBlock.containsKey('score')) vc.GenAI_Rep_Effectiveness_Score__c = Integer.valueOf(scoreBlock.get('score'));
                    if (scoreBlock.containsKey('justification')) vc.GenAI_Rep_Effectiveness_Justification__c = (String) scoreBlock.get('justification');
                }

                voiceCallsToUpdate.add(vc);

            } catch (Exception e) {
                result.success = false;
                result.errorMessage = 'Error parsing JSON: ' + e.getMessage();
                System.debug('Error parsing JSON: ' + e.getMessage());
            }

            results.add(result);
        }

        if (!voiceCallsToUpdate.isEmpty()) {
            try {
                update voiceCallsToUpdate;
            } catch (Exception e) {
                for (Result r : results) {
                    r.success = false;
                    r.errorMessage = 'Error updating VoiceCall records: ' + e.getMessage();
                }
                System.debug('Error updating VoiceCall records: ' + e.getMessage());
            }
        }

        return results;
    }
}