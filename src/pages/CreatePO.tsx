                    aria-required="true"
                  />
                  {getFieldError('company', 'address')}
                </div>
                <div>
                  <Label htmlFor="company-contact" className="required">Phone Number</Label>
                  <Input
                    id="company-contact"
                    value={company.contact}
                    onChange={(e) => updateCompany('contact', e.target.value)}
                    placeholder="+234..."
                    required
                    aria-required="true"
                  />
                  {getFieldError('company', 'contact')}
                </div>
                <div>
                  <Label htmlFor="company-taxid" className="required">Tax Identification Number</Label>
                  <Input
                    id="company-taxid"
                    value={company.taxId}
                    onChange={(e) => updateCompany('taxId', e.target.value)}
                    placeholder="Enter TIN"
                    required
                    aria-required="true"
                  />
                  {getFieldError('company', 'taxId')}
                </div>
              </div>
            </div>

            <div className="po-form-section mb-8">
              <div className="flex items-center mb-4">
                <div className="mr-3 bg-yellow-100 p-2 rounded-full">
                  <WarehouseIcon className="h-5 w-5 text-yellow-600" />
                </div>
                <h3 className="text-lg font-medium">Supplier Details</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Supplier Name</Label>
                  <Input
                    value={supplierData.name}
                    onChange={(e) => updateSupplier('name', e.target.value)}
                    placeholder="e.g. Total Nigeria PLC"
                  />
                  {getFieldError('supplier', 'name')}
                </div>
                <div>
                  <Label>Depot Name</Label>
                  <Input
                    value={supplierData.depotName}
                    onChange={(e) => updateSupplier('depotName', e.target.value)}
                    placeholder="e.g. Apapa"
                  />
                </div>
                <div>
                  <Label>Depot Location</Label>
                  <Input
                    value={supplierData.depotLocation}
                    onChange={(e) => updateSupplier('depotLocation', e.target.value)}
                  />
                </div>
                <div>
                  <Label>RC Number</Label>
                  <Input
                    value={supplierData.regNumber}
                    onChange={(e) => updateSupplier('regNumber', e.target.value)}
                    placeholder="CAC Reg. No."
                  />
                </div>
                <div>
                  <Label>Contact Person</Label>
                  <Input
                    value={supplierData.contactPerson}
                    onChange={(e) => updateSupplier('contactPerson', e.target.value)}
                  />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={supplierData.email}
                    onChange={(e) => updateSupplier('email', e.target.value)}
                    placeholder="example@email.com"
                  />
                  {getFieldError('supplier', 'email')}
                </div>
                <div>
                  <Label>Phone</Label>
                  <Input
                    value={supplierData.contact}
                    onChange={(e) => updateSupplier('contact', e.target.value)}
                    placeholder="+234..."
                  />
                  {getFieldError('supplier', 'contact')}
                </div>
                <div>
                  <Label>Address</Label>
                  <Input
                    value={supplierData.address}
                    onChange={(e) => updateSupplier('address', e.target.value)}
                    placeholder="Supplier address"
                  />
                  {getFieldError('supplier', 'address')}
                </div>
                <div>
                  <Label>Supplier Type</Label>
                  <Select
                    value={supplierData.supplierType}
                    onValueChange={(value) =>
                      updateSupplier('supplierType', value as SupplierData['supplierType'])
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Major">Major</SelectItem>
                      <SelectItem value="Independent">Independent</SelectItem>
                      <SelectItem value="Government">Government</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="mt-4">
                <Label className="block mb-2">Products Offered</Label>
                <div className="flex gap-4">
                  {(['PMS', 'AGO', 'DPK'] as const).map((product) => (
                    <label key={product} className="flex items-center gap-2">
                      <Checkbox
                        checked={supplierData.products[product]}
                        onCheckedChange={(checked) =>
                          updateSupplier('products', { product, checked: Boolean(checked) })
                        }
                      />
                      <span>{product}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="po-form-section mb-8">
              <div className="flex items-center mb-4">
                <div className="mr-3 bg-purple-100 p-2 rounded-full">
                  <Fuel className="h-5 w-5 text-purple-600" />
                </div>
                <h3 className="text-lg font-medium">Order Items</h3>
              </div>
              <div className="space-y-4">
                {items.map((item, index) => (
                  <div key={item.id} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end border p-4 rounded-lg relative">
                    <div>
                      <Label>Product</Label>
                      <Select
                        value={item.product}
                        onValueChange={(val) => debouncedUpdateItem(item.id, 'product', val)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PMS">PMS</SelectItem>
                          <SelectItem value="AGO">AGO</SelectItem>
                          <SelectItem value="DPK">DPK</SelectItem>
                        </SelectContent>
                      </Select>
                      {getFieldError('items', `product_${index}`)}
                    </div>
                    <div>
                      <Label>Quantity (Liters)</Label>
                      <Input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => debouncedUpdateItem(item.id, 'quantity', parseFloat(e.target.value))}
                      />
                      {getFieldError('items', `quantity_${index}`)}
                    </div>
                    <div>
                      <Label>Unit Price (₦)</Label>
                      <Input
                        type="number"
                        value={item.unitPrice}
                        onChange={(e) => debouncedUpdateItem(item.id, 'unitPrice', parseFloat(e.target.value))}
                      />
                      {getFieldError('items', `unitPrice_${index}`)}
                    </div>
                    <div>
                      <Label>Total (₦)</Label>
                      <Input value={item.totalPrice.toFixed(2)} disabled />
                    </div>
                    {items.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        className="absolute top-2 right-2 text-red-500"
                        onClick={() => removeItem(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button type="button" variant="outline" onClick={addItem} className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Add Item
                </Button>
              </div>
            </div>

            <div className="po-form-section mb-8">
              <div className="flex items-center mb-4">
                <div className="mr-3 bg-indigo-100 p-2 rounded-full">
                  <Truck className="h-5 w-5 text-indigo-600" />
                </div>
                <h3 className="text-lg font-medium">Delivery & Payment</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Payment Terms</Label>
                  <Select
                    value={paymentTerm}
                    onValueChange={(val) => setPaymentTerm(val as PaymentTerm)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="50% Advance">50% Advance</SelectItem>
                      <SelectItem value="100% Advance">100% Advance</SelectItem>
                      <SelectItem value="Credit">Credit</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Delivery Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn("w-full justify-start text-left font-normal", !deliveryDate && "text-muted-foreground")}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {deliveryDate ? format(deliveryDate, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={deliveryDate}
                        onSelect={setDeliveryDate}
                        disabled={(date) => date < new Date()}
                      />
                    </PopoverContent>
                  </Popover>
                  {getFieldError('items', 'deliveryDate')}
                </div>
              </div>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex justify-between items-center border-t pt-4">
          <div className="text-lg font-semibold">Grand Total: ₦{grandTotal.toLocaleString()}</div>
          <Button type="submit" form="create-po-form" disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Create Purchase Order'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default CreatePO;
