export type FlowDataField = {
	name: string;
	type: string;
	required: boolean;
};

export type Flow = {
	name: string;
	display_name: string;
	provider: string;
	data_fields: FlowDataField[];
};
