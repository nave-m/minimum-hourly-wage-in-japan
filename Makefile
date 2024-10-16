OUTPUT=packages/grpc/src/gen
GRPC_TOOL=grpc_tools_node_protoc
TYPESCRIPT_PLUGIN=protoc-gen-ts=./node_modules/.bin/protoc-gen-ts
WAGE_PROTO_PATH=./packages/grpc/doc/proto
GOOGLE_PROTO_PATH=./node_modules/google-proto-files
DESCRIPTOR_OUTPUT=packages/grpc/src/gen/descriptor_set.bin
COMMAND=npx $(GRPC_TOOL) --plugin=$(TYPESCRIPT_PLUGIN) --descriptor_set_out=$(DESCRIPTOR_OUTPUT) --include_imports --js_out=import_style=commonjs,binary:$(OUTPUT) --grpc_out=grpc_js:$(OUTPUT) --ts_out=grpc_js:$(OUTPUT) --proto_path=$(GOOGLE_PROTO_PATH) --proto_path=$(WAGE_PROTO_PATH) $(WAGE_PROTO_PATH)/jp/wage/api/v1/*.proto $(GOOGLE_PROTO_PATH)/google/type/date.proto $(GOOGLE_PROTO_PATH)/google/rpc/error_details.proto 

.PHONY: protogen
protogen:
	# clean up previous output
	rm -rf $(OUTPUT) && mkdir -p $(OUTPUT)
	# generate js codes via grpc-tools
	$(COMMAND)